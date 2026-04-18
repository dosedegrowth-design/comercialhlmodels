"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Vendedor } from "@/types/database";

export function useVendedores(apenasAtivos = false) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["vendedores", apenasAtivos],
    queryFn: async () => {
      let q = supabase.from("vendedores").select("*").order("nome");
      if (apenasAtivos) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Vendedor[];
    },
  });
}

export function useVendedorPerformance() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["vendedor-performance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_performance_vendedor")
        .select("*")
        .order("total_leads_recebidos", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
}

export function useCreateVendedor() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (v: Partial<Vendedor> & { nome: string }) => {
      const { data, error } = await supabase.from("vendedores").insert(v).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendedores"] }),
  });
}

export function useUpdateVendedor() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Vendedor> & { id: string }) => {
      const { data, error } = await supabase.from("vendedores").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendedores"] }),
  });
}

export function useDeleteVendedor() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendedores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendedores"] }),
  });
}

interface DistribuirParams {
  vendedor_id: string;
  quantidade: number;
  filtros?: { status?: string; origem_sheet_tab?: string; campanha_id?: string };
  observacao?: string;
}

export function useDistribuirLeads() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (p: DistribuirParams) => {
      const { data, error } = await supabase.rpc("distribuir_leads", {
        p_vendedor_id: p.vendedor_id,
        p_filtros: p.filtros ?? {},
        p_quantidade: p.quantidade,
        p_observacao: p.observacao ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["vendedor-performance"] });
    },
  });
}

export function useLeadsSemVendedor() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["leads-sem-vendedor"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .is("vendedor_id", null);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });
}
