import type { Lead } from "@/types/database";

export type HeatLevel = "hot" | "fast" | "warm" | "cold" | "neutral";

export interface HeatInfo {
  level: HeatLevel;
  label: string;
  description: string;
}

/**
 * Calcula a "temperatura" do lead baseado em status + último contato
 */
export function calcLeadHeat(lead: Lead): HeatInfo {
  const now = Date.now();
  const criadoEm = lead.lead_criado_em ? new Date(lead.lead_criado_em).getTime() : new Date(lead.created_at).getTime();
  const horasDesdeChegada = (now - criadoEm) / (1000 * 60 * 60);

  // Sem telefone E sem email = sem contato possível
  if (!lead.telefone && !lead.email) {
    return { level: "neutral", label: "Sem contato", description: "Dados de contato ausentes" };
  }

  // Fechado ou Agendado = sempre fast (bom resultado)
  if (lead.status === "fechado" || lead.status === "agendado") {
    return { level: "fast", label: "Bom retorno", description: "Lead avançou no funil" };
  }

  // Perdido ou sem interesse = cold (encerrado)
  if (lead.status === "perdido" || lead.status === "sem_interesse") {
    return { level: "cold", label: "Encerrado", description: "Lead não converteu" };
  }

  const ultimoContato = lead.ultimo_contato ? new Date(lead.ultimo_contato).getTime() : null;
  const horasSemContato = ultimoContato ? (now - ultimoContato) / (1000 * 60 * 60) : horasDesdeChegada;

  if (lead.status === "novo") {
    if (horasDesdeChegada < 1) return { level: "hot", label: "Novo", description: "Acabou de chegar" };
    if (horasDesdeChegada < 6) return { level: "hot", label: "Recente", description: "Menos de 6h" };
    if (horasDesdeChegada < 24) return { level: "warm", label: "Aguardando", description: "Mais de 6h sem resposta" };
    if (horasDesdeChegada < 72) return { level: "warm", label: "Esfriando", description: "1-3 dias parado" };
    return { level: "cold", label: "Frio", description: "Mais de 3 dias sem ação" };
  }

  if (lead.status === "contato_feito") {
    if (horasSemContato < 24) return { level: "fast", label: "Em contato", description: "Follow-up recente" };
    if (horasSemContato < 72) return { level: "warm", label: "Follow-up", description: "Precisa novo contato" };
    return { level: "cold", label: "Esfriando", description: "Sem retorno há dias" };
  }

  if (lead.status === "qualificado") {
    if (horasSemContato < 48) return { level: "fast", label: "Qualificado", description: "Interessado" };
    return { level: "warm", label: "Follow-up", description: "Qualificado há dias sem avanço" };
  }

  return { level: "neutral", label: "—", description: "" };
}

export function heatClass(level: HeatLevel): string {
  return `heat-${level}`;
}
