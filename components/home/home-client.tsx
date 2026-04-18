"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Target, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Trophy, Clock,
} from "lucide-react";
import { Sparkline } from "@/components/ui/sparkline";
import { LeadsChart } from "@/components/charts/leads-chart";
import { StatusDonut } from "@/components/charts/status-donut";
import { HeatBadge } from "@/components/leads/heat-badge";
import { calcLeadHeat } from "@/lib/utils/heat";
import { formatPhone, fromNow } from "@/lib/utils";
import type { Lead } from "@/types/database";
import { cn } from "@/lib/utils";

interface Props {
  kpis: any;
  leadsPorDia: any[];
  topCampanhas: any[];
  perfVendedores: any[];
  leadsRecentes: Lead[];
  semVendedor: number;
}

export function HomePageClient({ kpis, leadsPorDia, perfVendedores, leadsRecentes, semVendedor }: Props) {
  const sparkData = [...leadsPorDia].reverse().slice(-7).map((d: any) => Number(d.total) || 0);
  while (sparkData.length < 7) sparkData.unshift(0);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe seus leads, vendedores e conversões em tempo real.
          </p>
        </div>
        <Link
          href="/board"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-brand text-white text-sm font-medium shadow-card hover:opacity-90 transition-opacity"
        >
          Ver leads
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-xl p-5 text-white shadow-card bg-gradient-brand"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Leads captados</span>
              <Users className="w-4 h-4 text-white/80" />
            </div>
            <div className="text-4xl font-bold mb-1">{(kpis?.total_geral ?? 0).toLocaleString("pt-BR")}</div>
            <div className="text-xs text-white/80">{kpis?.taxa_conversao_pct ?? 0}% taxa de conversão geral</div>
            <div className="mt-3 h-8 opacity-80">
              <Sparkline data={sparkData} color="rgba(255,255,255,0.9)" height={32} />
            </div>
          </div>
        </motion.div>

        {[
          { label: "Novos", value: kpis?.total_novos ?? 0, icon: Sparkles, color: "hsl(210 90% 55%)", bg: "bg-blue-500/10" },
          { label: "Em contato", value: kpis?.total_contato ?? 0, icon: Target, color: "hsl(45 95% 55%)", bg: "bg-amber-500/10" },
          { label: "Fechados", value: kpis?.total_fechados ?? 0, icon: CheckCircle2, color: "hsl(145 70% 45%)", bg: "bg-emerald-500/10" },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
              className="bg-card border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.label}</span>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", c.bg)}>
                  <Icon className="w-4 h-4" style={{ color: c.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight mb-1">{c.value.toLocaleString("pt-BR")}</div>
              <div className="h-8">
                <Sparkline data={sparkData} color={c.color} height={32} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {semVendedor > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex items-center gap-4 flex-wrap"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="font-semibold">{semVendedor.toLocaleString("pt-BR")} leads aguardando distribuição</div>
            <div className="text-xs text-muted-foreground">
              Distribua para seus vendedores em massa e aumente a conversão
            </div>
          </div>
          <Link
            href="/vendedores"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Distribuir agora
          </Link>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-card border rounded-xl p-5 shadow-card min-h-[340px]"
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
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl p-5 shadow-card min-h-[340px]"
        >
          <div className="mb-4">
            <h3 className="font-semibold">Funil de status</h3>
            <p className="text-xs text-muted-foreground">Distribuição atual</p>
          </div>
          <StatusDonut kpis={kpis} />
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border rounded-xl shadow-card overflow-hidden"
        >
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Leads aguardando contato</h3>
              <p className="text-xs text-muted-foreground">Entraram recentemente</p>
            </div>
            <Link href="/board" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todos
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y">
            {leadsRecentes.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">Nenhum lead novo aguardando.</div>
            )}
            {leadsRecentes.map((lead) => {
              const heat = calcLeadHeat(lead);
              return (
                <Link
                  key={lead.id}
                  href="/board"
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(lead.nome ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{lead.nome ?? "Sem nome"}</span>
                      <HeatBadge heat={heat} size="sm" />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {formatPhone(lead.telefone) || lead.email || "—"} · {lead.origem_sheet_tab?.trim()}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground shrink-0">
                    {lead.lead_criado_em ? fromNow(lead.lead_criado_em) : fromNow(lead.created_at)}
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-xl shadow-card overflow-hidden"
        >
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top vendedores
              </h3>
              <p className="text-xs text-muted-foreground">Por leads recebidos</p>
            </div>
            <Link href="/vendedores" className="text-xs text-primary hover:underline flex items-center gap-1">
              Gerenciar
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {perfVendedores.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Nenhum vendedor cadastrado ainda.
                <br />
                <Link href="/vendedores" className="text-primary underline">
                  Cadastrar primeiro vendedor
                </Link>
              </div>
            )}
            {perfVendedores.map((v: any, idx: number) => {
              const total = Number(v.total_leads_recebidos) || 0;
              const fechados = Number(v.fechados) || 0;
              const conversao = Number(v.taxa_conversao_pct) || 0;
              const maxTotal = Math.max(...perfVendedores.map((p: any) => Number(p.total_leads_recebidos) || 0), 1);
              const pct = (total / maxTotal) * 100;
              return (
                <div key={v.vendedor_id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          idx === 0 && "bg-amber-500/20 text-amber-600",
                          idx === 1 && "bg-gray-400/20 text-gray-500",
                          idx === 2 && "bg-orange-500/20 text-orange-600",
                          idx > 2 && "bg-muted text-muted-foreground",
                        )}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium">{v.vendedor_nome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{fechados}/{total}</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> {conversao}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + idx * 0.05, duration: 0.5 }}
                      className="h-full bg-gradient-brand rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
