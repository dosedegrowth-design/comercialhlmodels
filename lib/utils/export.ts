import type { Lead } from "@/types/database";
import { STATUS_LABELS, formatPhone, formatDateTime } from "@/lib/utils";

export function exportLeadsCSV(leads: Lead[], filename = `leads-${Date.now()}.csv`) {
  const headers = [
    "Nome", "Telefone", "Email", "Status", "Campanha", "Grupo de Anúncios",
    "Anúncio", "Formulário", "Plataforma", "Data do Lead", "Último Contato", "Observações",
  ];

  const rows = leads.map((l) => [
    l.nome ?? "",
    formatPhone(l.telefone) ?? "",
    l.email ?? "",
    STATUS_LABELS[l.status] ?? l.status,
    l.campanha_nome ?? "",
    l.adset_nome ?? "",
    l.ad_nome ?? "",
    l.origem_sheet_tab?.trim() ?? "",
    l.platform ?? "",
    l.lead_criado_em ? formatDateTime(l.lead_criado_em) : "",
    l.ultimo_contato ? formatDateTime(l.ultimo_contato) : "",
    (l.observacoes ?? "").replace(/\n/g, " "),
  ]);

  const esc = (v: string) => {
    const s = v.toString();
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
