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
  vendedor_id: string | null;
  distribuicao_id: string | null;
  atribuido_em: string | null;
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

export interface Vendedor {
  id: string;
  profile_id: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  peso_distribuicao: number;
  max_leads_por_dia: number | null;
  created_at: string;
  updated_at: string;
}

export interface Distribuicao {
  id: string;
  vendedor_id: string;
  total_leads: number;
  filtro_aplicado: Record<string, unknown> | null;
  criado_por: string | null;
  observacao: string | null;
  created_at: string;
}

export interface SyncLog {
  id: string;
  tipo: string;
  status: string;
  rows_affected: number;
  mensagem: string | null;
  detalhes: Record<string, unknown> | null;
  executado_em: string;
}

type SchemaTables = {
  leads: { Row: Lead; Insert: Partial<Lead> & { id?: string }; Update: Partial<Lead> };
  profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile> };
  status_historico: { Row: StatusHistorico; Insert: Partial<StatusHistorico>; Update: Partial<StatusHistorico> };
  vendedores: { Row: Vendedor; Insert: Partial<Vendedor> & { nome: string }; Update: Partial<Vendedor> };
  distribuicoes: { Row: Distribuicao; Insert: Partial<Distribuicao> & { vendedor_id: string; total_leads: number }; Update: Partial<Distribuicao> };
  sync_log: { Row: SyncLog; Insert: Partial<SyncLog>; Update: Partial<SyncLog> };
  config: {
    Row: { id: number; blocked_tabs: string[]; google_sheet_id: string | null; column_mapping: Record<string, unknown>; facebook_pixel_id: string | null; notify_new_lead: boolean; updated_at: string };
    Insert: Record<string, unknown>;
    Update: Record<string, unknown>;
  };
};

type SchemaViews = {
  v_kpis_overview: {
    Row: {
      total_novos: number | null;
      total_contato: number | null;
      total_qualificados: number | null;
      total_agendados: number | null;
      total_fechados: number | null;
      total_perdidos: number | null;
      total_geral: number | null;
      taxa_conversao_pct: number | null;
    };
  };
  v_leads_por_campanha: {
    Row: {
      campanha_id: string;
      campanha_nome: string | null;
      total_leads: number;
      qualificados: number;
      fechados: number;
      perdidos: number;
      taxa_conversao_pct: number | null;
    };
  };
  v_leads_por_dia: { Row: { dia: string; total: number; fechados: number } };
  v_performance_vendedor: {
    Row: {
      vendedor_id: string;
      vendedor_nome: string;
      ativo: boolean;
      total_leads_recebidos: number;
      contato_feito: number;
      qualificados: number;
      agendados: number;
      fechados: number;
      perdidos: number;
      pendentes: number;
      taxa_conversao_pct: number | null;
      taxa_contato_pct: number | null;
      ultima_atribuicao: string | null;
    };
  };
};

export interface Database {
  hl_comercial: {
    Tables: SchemaTables;
    Views: SchemaViews;
    Functions: Record<string, never>;
    Enums: { lead_status: LeadStatus; user_role: UserRole };
  };
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
