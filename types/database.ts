/**
 * Types do Supabase para schema hl_comercial.
 *
 * Regenerar via:
 *   npm run supabase:types
 *
 * Por enquanto, definido manualmente até primeiro deploy.
 */

export type LeadStatus =
  | "novo"
  | "contato_feito"
  | "qualificado"
  | "agendado"
  | "fechado"
  | "perdido"
  | "sem_interesse";

export type UserRole = "admin" | "cliente" | "comercial" | "marketing";

export interface Lead {
  id: string;
  lead_id_meta: string | null;
  form_id: string | null;
  form_nome: string | null;
  campanha_id: string | null;
  campanha_nome: string | null;
  adset_id: string | null;
  adset_nome: string | null;
  ad_id: string | null;
  ad_nome: string | null;
  platform: string | null;
  placement: string | null;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  dados_extras: Record<string, unknown>;
  status: LeadStatus;
  responsavel_id: string | null;
  observacoes: string | null;
  ultimo_contato: string | null;
  origem_sheet_tab: string | null;
  origem_sheet_row: number | null;
  lead_criado_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  nome: string | null;
  avatar_url: string | null;
  role: UserRole;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusHistorico {
  id: string;
  lead_id: string;
  status_anterior: LeadStatus | null;
  status_novo: LeadStatus;
  alterado_por: string | null;
  observacao: string | null;
  sincronizado_sheets: boolean;
  sincronizado_capi: boolean;
  alterado_em: string;
}

export interface Database {
  hl_comercial: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Partial<Lead> & { id?: string };
        Update: Partial<Lead>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
      };
      status_historico: {
        Row: StatusHistorico;
        Insert: Partial<StatusHistorico>;
        Update: Partial<StatusHistorico>;
      };
    };
    Views: {
      v_kpis_overview: { Row: Record<string, number | null> };
      v_leads_por_campanha: { Row: Record<string, unknown> };
      v_leads_por_dia: { Row: { dia: string; total: number; fechados: number } };
    };
    Functions: Record<string, never>;
    Enums: { lead_status: LeadStatus; user_role: UserRole };
  };
}
