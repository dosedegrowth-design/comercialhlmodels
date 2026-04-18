"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Config {
  id: number;
  google_sheet_id: string | null;
  facebook_pixel_id: string | null;
  notify_new_lead: boolean;
  blocked_tabs: string[];
  capi_ativo: boolean;
  capi_eventos: string[];
}

export function useConfig() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("config").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as Config;
    },
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (patch: Partial<Config>) => {
      const { data, error } = await supabase.from("config").update(patch).eq("id", 1).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config"] }),
  });
}

export function useSyncLogs() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["sync-logs-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_log")
        .select("*")
        .order("executado_em", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 15_000,
  });
}

export function useTestCAPI() {
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ lead_id, status_novo, dry_run }: { lead_id: string; status_novo: string; dry_run?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("send-capi-event", {
        body: { lead_id, status_novo, dry_run: !!dry_run },
      });
      if (error) throw error;
      return data;
    },
  });
}
