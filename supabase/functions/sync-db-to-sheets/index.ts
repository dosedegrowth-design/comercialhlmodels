// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: sync-db-to-sheets
// ─────────────────────────────────────────────────────────────────────────
// Quando status de um lead muda no Supabase, atualiza a célula correspondente
// na planilha do Google Sheets (pra manter o Pixel/CAPI atualizado).
//
// Trigger: chamada via Postgres function (ou cron que varre status_historico
// com sincronizado_sheets = false).
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHEETS_ID = Deno.env.get("GOOGLE_SHEETS_ID")!;
const SA_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")!;
const SA_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")!;

// Nome exato da coluna no Google Sheets que será atualizada com o status
const STATUS_COLUMN_HEADER = "lead_status";

// (reutiliza getAccessToken da outra function — pode ser extraído pra shared)
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
  const enc = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsigned = `${enc(header)}.${enc(payload)}`;
  const pem = SA_KEY.replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${unsigned}.${sigB64}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const j = await r.json();
  return j.access_token;
}

async function findStatusColumn(token: string, tab: string): Promise<number | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(tab)}!1:1`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  const header: string[] = data.values?.[0] ?? [];
  const idx = header.findIndex((h) => h.toLowerCase().trim() === STATUS_COLUMN_HEADER);
  return idx >= 0 ? idx : null;
}

// Converte idx 0-based em letra A, B, ..., AA, AB...
function colLetter(idx: number): string {
  let n = idx + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

async function updateCell(token: string, tab: string, col: number, row: number, value: string) {
  const range = `${tab}!${colLetter(col)}${row}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [[value]] }),
  });
}

Deno.serve(async (_req) => {
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: "hl_comercial" },
  });

  try {
    // Busca mudanças pendentes
    const { data: pending, error } = await db
      .from("status_historico")
      .select("id, lead_id, status_novo, leads(origem_sheet_tab, origem_sheet_row)")
      .eq("sincronizado_sheets", false)
      .limit(50);

    if (error) throw error;
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = await getAccessToken();
    const tabCache: Record<string, number | null> = {};
    let processed = 0;

    for (const p of pending) {
      // biome-ignore lint/suspicious/noExplicitAny: Supabase relational query
      const lead = (p as any).leads;
      if (!lead?.origem_sheet_tab || !lead.origem_sheet_row) continue;

      if (!(lead.origem_sheet_tab in tabCache)) {
        tabCache[lead.origem_sheet_tab] = await findStatusColumn(token, lead.origem_sheet_tab);
      }
      const col = tabCache[lead.origem_sheet_tab];
      if (col === null) continue;

      // biome-ignore lint/suspicious/noExplicitAny: record type
      await updateCell(token, lead.origem_sheet_tab, col, lead.origem_sheet_row, (p as any).status_novo);

      // biome-ignore lint/suspicious/noExplicitAny: record type
      await db.from("status_historico").update({ sincronizado_sheets: true }).eq("id", (p as any).id);
      processed++;
    }

    await db.from("sync_log").insert({
      tipo: "db_to_sheets",
      status: "success",
      rows_affected: processed,
    });

    return new Response(JSON.stringify({ ok: true, processed }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
