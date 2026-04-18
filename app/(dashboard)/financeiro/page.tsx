import { createClient } from "@/lib/supabase/server";
import { FinanceiroClient } from "@/components/financeiro/financeiro-client";

export const revalidate = 30;

export default async function FinanceiroPage() {
  const supabase = await createClient();

  const [kpisRes, porCampanhaRes, porVendedorRes, porDiaRes, porFormRes, ultimasVendasRes] = await Promise.all([
    supabase.from("v_kpis_overview").select("*").single(),
    supabase.from("v_valor_por_campanha").select("*").limit(20),
    supabase.from("v_receita_vendedor").select("*").limit(20),
    supabase.from("v_receita_por_dia").select("*").limit(60),
    supabase.from("v_receita_por_formulario").select("*").limit(20),
    supabase
      .from("leads")
      .select("id, nome, valor_fechamento, data_fechamento, produto_servico, campanha_nome, origem_sheet_tab, vendedor_id")
      .eq("status", "fechado")
      .order("data_fechamento", { ascending: false, nullsFirst: false })
      .limit(20),
  ]);

  return (
    <FinanceiroClient
      kpis={kpisRes.data ?? null}
      porCampanha={porCampanhaRes.data ?? []}
      porVendedor={porVendedorRes.data ?? []}
      porDia={porDiaRes.data ?? []}
      porFormulario={porFormRes.data ?? []}
      ultimasVendas={(ultimasVendasRes.data ?? []) as any}
    />
  );
}
