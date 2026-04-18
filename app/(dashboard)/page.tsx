import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Users, Target, CheckCircle2, XCircle, Calendar } from "lucide-react";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: kpis } = await supabase.from("v_kpis_overview").select("*").single();

  const cards = [
    { label: "Novos", value: kpis?.total_novos ?? 0, icon: Users, color: "text-status-novo" },
    { label: "Em Contato", value: kpis?.total_contato ?? 0, icon: Target, color: "text-status-contato" },
    { label: "Qualificados", value: kpis?.total_qualificados ?? 0, icon: TrendingUp, color: "text-status-qualificado" },
    { label: "Agendados", value: kpis?.total_agendados ?? 0, icon: Calendar, color: "text-status-agendado" },
    { label: "Fechados", value: kpis?.total_fechados ?? 0, icon: CheckCircle2, color: "text-status-fechado" },
    { label: "Perdidos", value: kpis?.total_perdidos ?? 0, icon: XCircle, color: "text-status-perdido" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">Indicadores comerciais em tempo real</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div className="text-2xl font-semibold">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Total Geral</h2>
            <p className="text-sm text-muted-foreground">Taxa de conversão geral</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{kpis?.total_geral ?? 0}</div>
            <div className="text-sm text-status-fechado">
              {kpis?.taxa_conversao_pct ?? 0}% conversão
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 min-h-[300px]">
          <h3 className="font-semibold mb-2">Leads por Dia</h3>
          <p className="text-sm text-muted-foreground mb-4">Últimos 30 dias</p>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            📈 Gráfico (Fase 4)
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 min-h-[300px]">
          <h3 className="font-semibold mb-2">Top Campanhas</h3>
          <p className="text-sm text-muted-foreground mb-4">Por volume de leads</p>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            📊 Gráfico (Fase 4)
          </div>
        </div>
      </div>
    </div>
  );
}
