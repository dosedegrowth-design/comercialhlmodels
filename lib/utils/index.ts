import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LeadStatus } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contato_feito: "Contato Feito",
  qualificado: "Qualificado",
  agendado: "Agendado",
  fechado: "Fechado",
  perdido: "Perdido",
  sem_interesse: "Sem Interesse",
};

export const STATUS_ORDER: LeadStatus[] = [
  "novo",
  "contato_feito",
  "qualificado",
  "agendado",
  "fechado",
  "perdido",
  "sem_interesse",
];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-status-novo/10 text-status-novo border-status-novo/30",
  contato_feito: "bg-status-contato/10 text-status-contato border-status-contato/30",
  qualificado: "bg-status-qualificado/10 text-status-qualificado border-status-qualificado/30",
  agendado: "bg-status-agendado/10 text-status-agendado border-status-agendado/30",
  fechado: "bg-status-fechado/10 text-status-fechado border-status-fechado/30",
  perdido: "bg-status-perdido/10 text-status-perdido border-status-perdido/30",
  sem_interesse: "bg-status-sem_interesse/10 text-status-sem_interesse border-status-sem_interesse/30",
};

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy") {
  return format(new Date(date), pattern, { locale: ptBR });
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function fromNow(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

export function formatPhone(phone: string | null | undefined) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return phone;
}

export function whatsappLink(phone: string | null | undefined, message?: string) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const base = digits.startsWith("55") ? digits : `55${digits}`;
  const msg = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${base}${msg}`;
}
