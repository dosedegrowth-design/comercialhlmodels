"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/types/database";

export interface LeadsFilter {
  status?: LeadStatus[];
  campanha_id?: string;
  origem_sheet_tab?: string;
  vendedor_id?: string | null; // null = sem atribuição
  search?: string;
  from?: string; // ISO date
  to?: string;
  page?: number;
  pageSize?: number;
}

export function useLeads(filters: LeadsFilter = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      let q = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .order("lead_criado_em", { ascending: false, nullsFirst: false });

      if (filters.status && filters.status.length > 0) q = q.in("status", filters.status);
      if (filters.campanha_id) q = q.eq("campanha_id", filters.campanha_id);
      if (filters.origem_sheet_tab) q = q.eq("origem_sheet_tab", filters.origem_sheet_tab);
      if (filters.vendedor_id === null) q = q.is("vendedor_id", null);
      else if (filters.vendedor_id) q = q.eq("vendedor_id", filters.vendedor_id);
      if (filters.search) {
        const s = filters.search.trim();
        q = q.or(`nome.ilike.%${s}%,telefone.ilike.%${s}%,email.ilike.%${s}%`);
      }
      if (filters.from) q = q.gte("lead_criado_em", filters.from);
      if (filters.to) q = q.lte("lead_criado_em", filters.to);

      const page = filters.page ?? 0;
      const pageSize = filters.pageSize ?? 100;
      q = q.range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error, count } = await q;
      if (error) throw error;
      return { leads: (data ?? []) as Lead[], total: count ?? 0 };
    },
    staleTime: 30_000,
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status, ultimo_contato: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useLead(id: string | null) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Lead;
    },
    enabled: !!id,
  });
}

export function useStatusHistory(leadId: string | null) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["status-history", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data, error } = await supabase
        .from("status_historico")
        .select("*")
        .eq("lead_id", leadId)
        .order("alterado_em", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!leadId,
  });
}

export function useCampanhas() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["campanhas-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("campanha_id, campanha_nome")
        .not("campanha_id", "is", null);
      if (error) throw error;
      const unique = new Map<string, string>();
      (data ?? []).forEach((l) => {
        if (l.campanha_id && !unique.has(l.campanha_id)) {
          unique.set(l.campanha_id, l.campanha_nome ?? l.campanha_id);
        }
      });
      return Array.from(unique, ([id, nome]) => ({ id, nome }));
    },
    staleTime: 5 * 60_000,
  });
}

export function useAbas() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["abas-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("origem_sheet_tab")
        .not("origem_sheet_tab", "is", null);
      if (error) throw error;
      const unique = new Set<string>();
      (data ?? []).forEach((l) => l.origem_sheet_tab && unique.add(l.origem_sheet_tab));
      return Array.from(unique).sort();
    },
    staleTime: 5 * 60_000,
  });
}
