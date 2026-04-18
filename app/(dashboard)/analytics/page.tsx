import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export const revalidate = 30;

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [funilRes, campanhaRes, adsetRes, adRes, heatmapRes, tempoRes, comparativoRes, porFormRes] =
    await Promise.all([
      supabase.from("v_analytics_funil").select("*").single(),
      supabase.from("v_valor_por_campanha").select("*").limit(20),
      supabase.from("v_analytics_adset").select("*").limit(15),
      supabase.from("v_analytics_ad").select("*").limit(15),
      supabase.from("v_analytics_heatmap").select("*"),
      supabase.from("v_analytics_tempo_conversao").select("*").single(),
      supabase.from("v_analytics_comparativo").select("*").single(),
      supabase.from("v_receita_por_formulario").select("*").limit(10),
    ]);

  return (
    <AnalyticsClient
      funil={funilRes.data ?? null}
      campanhas={campanhaRes.data ?? []}
      adsets={adsetRes.data ?? []}
      ads={adRes.data ?? []}
      heatmap={heatmapRes.data ?? []}
      tempo={tempoRes.data ?? null}
      comparativo={comparativoRes.data ?? null}
      porFormulario={porFormRes.data ?? []}
    />
  );
}
