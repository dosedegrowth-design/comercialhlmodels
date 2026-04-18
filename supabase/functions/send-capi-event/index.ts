// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: send-capi-event
// ─────────────────────────────────────────────────────────────────────────
// Envia evento para Conversions API do Facebook quando status muda.
//
// Mapeamento:
//   qualificado → CompleteRegistration
//   agendado    → Schedule
//   fechado     → Purchase
//
// Body esperado:
// { lead_id: "uuid", status_novo: "fechado" }
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FB_PIXEL_ID = Deno.env.get("FB_PIXEL_ID");
const FB_ACCESS_TOKEN = Deno.env.get("FB_CAPI_ACCESS_TOKEN");
const FB_TEST_EVENT_CODE = Deno.env.get("FB_TEST_EVENT_CODE");

const EVENT_MAP: Record<string, string> = {
  qualificado: "CompleteRegistration",
  agendado: "Schedule",
  fechado: "Purchase",
};

async function sha256(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s.toLowerCase().trim());
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "FB CAPI não configurado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { lead_id, status_novo } = await req.json();
    const eventName = EVENT_MAP[status_novo];

    if (!eventName) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "status sem evento" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      db: { schema: "hl_comercial" },
    });

    const { data: lead } = await db
      .from("leads")
      .select("email, telefone, nome, lead_id_meta")
      .eq("id", lead_id)
      .single();

    if (!lead) throw new Error("Lead não encontrado");

    const userData: Record<string, string | string[]> = {};
    if (lead.email) userData.em = [await sha256(lead.email)];
    if (lead.telefone) userData.ph = [await sha256(lead.telefone.replace(/\D/g, ""))];
    if (lead.nome) {
      const parts = lead.nome.split(" ");
      userData.fn = [await sha256(parts[0] ?? "")];
      userData.ln = [await sha256(parts.slice(1).join(" "))];
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "system_generated",
          event_id: `${lead_id}-${eventName}`,
          user_data: userData,
          custom_data: { lead_meta_id: lead.lead_id_meta },
        },
      ],
      ...(FB_TEST_EVENT_CODE ? { test_event_code: FB_TEST_EVENT_CODE } : {}),
    };

    const r = await fetch(
      `https://graph.facebook.com/v20.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const resp = await r.json();
    const ok = r.ok;

    await db.from("sync_log").insert({
      tipo: "capi",
      status: ok ? "success" : "error",
      rows_affected: ok ? 1 : 0,
      mensagem: ok ? eventName : JSON.stringify(resp),
      detalhes: resp,
    });

    return new Response(JSON.stringify({ ok, event: eventName, response: resp }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
