"use client";

import { motion } from "framer-motion";
import { Users, Target, TrendingUp, Calendar, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";
import { LeadsChart } from "@/components/charts/leads-chart";
import { CampanhasChart } from "@/components/charts/campanhas-chart";
import { StatusDonut } from "@/components/charts/status-donut";

interface Props {
  kpis: any;
  leadsPorDia: any[];
  topCampanhas: any[];
}

export function HomePageClient({ kpis, leadsPorDia, topCampanhas }: Props) {
  const cards = [
    {
      label: "Novos",
      value: kpis?.total_novos ?? 0,
      icon: Users,
      gradient: "linear-gradient(135deg, hsl(210 90% 55%), hsl(190 85% 55%))",
    },
    {
      label: "Em Contato",
      value: kpis?.total_contato ?? 0,
      icon: Target,
      gradient: "linear-gradient(135deg, hsl(45 95% 55%), hsl(30 95% 55%))",
    },
    {
      label: "Qualificados",
      value: kpis?.total_qualificados ?? 0,
      icon: Sparkles,
      gradient: "linear-gradient(135deg, hsl(262 80% 60%), hsl(292 80% 60%))",
    },
    {
      label: "Agendados",
      value: kpis?.total_agendados ?? 0,
      icon: Calendar,
      gradient: "linear-gradient(135deg, hsl(180 75% 45%), hsl(195 75% 50%))",
    },
    {
      label: "Fechados",
      value: kpis?.total_fechados ?? 0,
      icon: CheckCircle2,
      gradient: "linear-gradient(135deg, hsl(145 70% 45%), hsl(165 70% 45%))",
    },
    {
      label: "Perdidos",
      value: kpis?.total_perdidos ?? 0,
      icon: XCircle,
      gradient: "linear-gradient(135deg, hsl(0 70% 55%), hsl(340 70% 55%))",
    },
  ];

  return (
    <div className="relative p-6 space-y-6">
      {/* Decorative grid background */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visão <span className="text-gradient">Geral</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Indicadores comerciais em tempo real</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-card border">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-glow" />
          <span className="text-xs text-muted-foreground">Dados ao vivo</span>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <KPICard key={c.label} {...c} delay={i * 0.05} />
        ))}
      </div>

      {/* Hero de conversão */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative bg-gradient-to-br from-primary/10 via-card to-card border rounded-xl p-6 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-brand rounded-full opacity-10 blur-3xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold">Total de leads captados</h2>
            <p className="text-sm text-muted-foreground">Conversão geral da base</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-gradient">
              {(kpis?.total_geral ?? 0).toLocaleString("pt-BR")}
            </div>
            <div className="text-sm text-green-500 mt-1 font-medium">
              {kpis?.taxa_conversao_pct ?? 0}% taxa de conversão
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2 bg-card border rounded-xl p-5 min-h-[340px]"
        >
          <div className="mb-4">
            <h3 className="font-semibold">Leads por dia</h3>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </div>
          <LeadsChart data={leadsPorDia} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border rounded-xl p-5 min-h-[340px]"
        >
          <div className="mb-4">
            <h3 className="font-semibold">Distribuição por status</h3>
            <p className="text-xs text-muted-foreground">Visão geral do funil</p>
          </div>
          <StatusDonut kpis={kpis} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-card border rounded-xl p-5"
      >
        <div className="mb-4">
          <h3 className="font-semibold">Top 10 campanhas</h3>
          <p className="text-xs text-muted-foreground">Por volume de leads</p>
        </div>
        <CampanhasChart data={topCampanhas} />
      </motion.div>
    </div>
  );
}
