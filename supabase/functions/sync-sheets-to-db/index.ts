// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: sync-sheets-to-db
// ─────────────────────────────────────────────────────────────────────────
// Lê todas as abas da planilha Google Sheets, detecta mapeamento de colunas
// e faz upsert na tabela hl_comercial.leads.
//
// Agendamento: cron a cada 5 minutos (configurar via Supabase Dashboard)
//
// Variáveis necessárias:
//   GOOGLE_SHEETS_ID
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHEETS_ID = Deno.env.get("GOOGLE_SHEETS_ID")!;
const SA_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")!;
const SA_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")!;

// ─── Google OAuth2 via Service Account ────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: SA_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsigned = `${enc(header)}.${enc(payload)}`;

  // Importa chave privada
  const pemContents = SA_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${unsigned}.${sigB64}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const json = await resp.json();
  return json.access_token;
}

// ─── Google Sheets API ────────────────────────────────────────────────────
async function listTabs(token: string): Promise<string[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}?fields=sheets.properties.title`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  return data.sheets?.map((s: { properties: { title: string } }) => s.properties.title) ?? [];
}

async function readTab(token: string, tab: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(tab)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  return data.values ?? [];
}

// ─── Mapeamento de colunas do Facebook Lead Ads ───────────────────────────
// Nomes possíveis para cada campo (case-insensitive)
const COLUMN_MAP: Record<string, string[]> = {
  lead_id_meta: ["id", "lead_id", "lead id"],
  lead_criado_em: ["created_time", "created_at", "data_criacao", "data de criação"],
  form_id: ["form_id", "form id"],
  form_nome: ["form_name", "formulário", "formulario"],
  campanha_id: ["campaign_id"],
  campanha_nome: ["campaign_name", "campanha"],
  adset_id: ["adset_id"],
  adset_nome: ["adset_name", "conjunto_anuncios"],
  ad_id: ["ad_id"],
  ad_nome: ["ad_name", "anúncio", "anuncio"],
  platform: ["platform", "plataforma"],
  nome: ["full_name", "nome", "name", "nome_completo"],
  telefone: ["phone_number", "phone", "telefone", "celular"],
  email: ["email", "e-mail"],
  status: ["lead_status", "status"],   // lê status já existente na planilha
};

function detectColumns(header: string[]): Record<string, number> {
  const found: Record<string, number> = {};
  const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "_");
  header.forEach((h, idx) => {
    const n = norm(h);
    for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
      if (aliases.some((a) => norm(a) === n)) {
        found[field] = idx;
        break;
      }
    }
  });
  return found;
}

// ─── Main Handler ─────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: "hl_comercial" },
  });

  const start = Date.now();
  let totalRows = 0;
  const errors: string[] = [];

  try {
    const token = await getAccessToken();
    const tabs = await listTabs(token);

    for (const tab of tabs) {
      try {
        const rows = await readTab(token, tab);
        if (rows.length < 2) continue;

        const header = rows[0];
        const cols = detectColumns(header);

        // Requer ao menos lead_id_meta OU (nome + telefone)
        if (!cols.lead_id_meta && !(cols.nome && cols.telefone)) {
          console.warn(`[${tab}] Colunas não reconhecidas, pulando`);
          continue;
        }

        const leads = rows.slice(1).map((row, idx) => {
          const get = (field: string) => (cols[field] !== undefined ? row[cols[field]] ?? null : null);

          // Coleta campos extras (tudo que não está mapeado)
          const extras: Record<string, string> = {};
          header.forEach((h, i) => {
            if (!Object.values(cols).includes(i)) extras[h] = row[i] ?? "";
          });

          return {
            lead_id_meta: get("lead_id_meta"),
            lead_criado_em: get("lead_criado_em"),
            form_id: get("form_id"),
            form_nome: get("form_nome") ?? tab,
            campanha_id: get("campanha_id"),
            campanha_nome: get("campanha_nome"),
            adset_id: get("adset_id"),
            adset_nome: get("adset_nome"),
            ad_id: get("ad_id"),
            ad_nome: get("ad_nome"),
            platform: get("platform"),
            nome: get("nome"),
            telefone: get("telefone"),
            email: get("email"),
            dados_extras: extras,
            origem_sheet_tab: tab,
            origem_sheet_row: idx + 2, // +1 header +1 1-based
          };
        });

        // Upsert
        const { error } = await db.from("leads").upsert(leads, {
          onConflict: "lead_id_meta",
          ignoreDuplicates: false,
        });

        if (error) {
          errors.push(`[${tab}] ${error.message}`);
        } else {
          totalRows += leads.length;
        }
      } catch (e) {
        errors.push(`[${tab}] ${(e as Error).message}`);
      }
    }

    await db.from("sync_log").insert({
      tipo: "sheets_to_db",
      status: errors.length === 0 ? "success" : "partial",
      rows_affected: totalRows,
      mensagem: errors.length > 0 ? errors.join("; ") : `Sync OK em ${Date.now() - start}ms`,
      detalhes: { tabs_count: tabs.length, errors },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        rows: totalRows,
        tabs: tabs.length,
        errors,
        duration_ms: Date.now() - start,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = (e as Error).message;
    await db.from("sync_log").insert({
      tipo: "sheets_to_db",
      status: "error",
      mensagem: msg,
    });
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
