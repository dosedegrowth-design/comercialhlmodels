"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, Target, BarChart3, Layers, Zap } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  funil: any;
  campanhas: any[];
  adsets: any[];
  ads: any[];
  heatmap: any[];
  tempo: any;
  comparativo: any;
  porFormulario: any[];
}

const COLORS_FUNNEL = ["hsl(210 90% 55%)", "hsl(45 95% 55%)", "hsl(262 80% 60%)", "hsl(180 75% 45%)", "hsl(145 70% 45%)"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pctChange(atual: number, anterior: number): { pct: number; up: boolean } {
  if (anterior === 0) return { pct: atual > 0 ? 100 : 0, up: atual > 0 };
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  return { pct: Math.abs(pct), up: pct >= 0 };
}

export function AnalyticsClient({ funil, campanhas, adsets, ads, heatmap, tempo, comparativo, porFormulario }: Props) {
  const [aba, setAba] = useState<"campanhas" | "adsets" | "ads">("campanhas");

  const total = Number(funil?.total ?? 0);
  const contatados = Number(funil?.contatados ?? 0);
  const qualificados = Number(funil?.qualificados ?? 0);
  const agendados = Number(funil?.agendados ?? 0);
  const fechados = Number(funil?.fechados ?? 0);

  const funilData = [
    { value: total, name: "Leads", fill: COLORS_FUNNEL[0] },
    { value: contatados, name: "Contatados", fill: COLORS_FUNNEL[1] },
    { value: qualificados, name: "Qualificados", fill: COLORS_FUNNEL[2] },
    { value: agendados, name: "Agendados", fill: COLORS_FUNNEL[3] },
    { value: fechados, name: "Fechados", fill: COLORS_FUNNEL[4] },
  ];

  const heatmapMax = Math.max(...heatmap.map((h: any) => Number(h.total) || 0), 1);
  function heatCell(dia: number, hora: number) {
    const item = heatmap.find((h: any) => Number(h.dia_semana) === dia && Number(h.hora) === hora);
    return item ? Number(item.total) : 0;
  }

  const cmpLeads = comparativo ? pctChange(Number(comparativo.leads_atual ?? 0), Number(comparativo.leads_anterior ?? 0)) : { pct: 0, up: true };
  const cmpFechados = comparativo ? pctChange(Number(comparativo.fechados_atual ?? 0), Number(comparativo.fechados_anterior ?? 0)) : { pct: 0, up: true };
  const cmpReceita = comparativo ? pctChange(Number(comparativo.receita_atual ?? 0), Number(comparativo.receita_anterior ?? 0)) : { pct: 0, up: true };

  const dataAba = aba === "campanhas" ? campanhas : aba === "adsets" ? adsets : ads;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Analytics <span className="text-gradient">de Marketing</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance de campanhas, funil de conversão e insights da operação.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Leads (30d)", value: Number(comparativo?.leads_atual ?? 0), cmp: cmpLeads, bg: "bg-blue-500/10", color: "hsl(210 90% 55%)" },
          { label: "Fechamentos (30d)", value: Number(comparativo?.fechados_atual ?? 0), cmp: cmpFechados, bg: "bg-emerald-500/10", color: "hsl(145 70% 45%)" },
          { label: "Receita (30d)", value: Number(comparativo?.receita_atual ?? 0), cmp: cmpReceita, bg: "bg-orange-500/10", color: "hsl(24 95% 53%)", isCurrency: true },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="bg-card border rounded-xl p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.label}</span>
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", c.bg)}>
                <Zap className="w-4 h-4" style={{ color: c.color }} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="text-2xl font-bold">
                {c.isCurrency ? formatCurrency(c.value) : c.value.toLocaleString("pt-BR")}
              </div>
              <div className={cn("flex items-center gap-0.5 text-xs font-semibold", c.cmp.up ? "text-emerald-600" : "text-red-500")}>
                {c.cmp.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {c.cmp.pct}%
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">vs 30 dias anteriores</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border rounded-xl p-5 shadow-card"
        >
          <div className="mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Funil de conversão
            </h3>
            <p className="text-xs text-muted-foreground">Jornada do lead até o fechamento</p>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {funilData.map((f, i) => {
              const pctOfTotal = total > 0 ? Math.round((f.value / total) * 100) : 0;
              return (
                <div key={f.name} className="text-center">
                  <div className="rounded-lg p-3 text-white relative" style={{ background: f.fill, opacity: 0.8 + i * 0.05 }}>
                    <div className="text-2xl font-bold">{f.value.toLocaleString("pt-BR")}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-90">{f.name}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{pctOfTotal}% do total</div>
                </div>
              );
            })}
          </div>
          <div className="pt-3 border-t text-xs text-muted-foreground">
            Receita total gerada pelos fechamentos:{" "}
            <strong className="text-emerald-600">{formatCurrency(Number(funil?.receita_fechamentos ?? 0))}</strong>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border rounded-xl p-5 shadow-card"
        >
          <div className="mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Tempo até fechamento
            </h3>
            <p className="text-xs text-muted-foreground">Dias da entrada até venda</p>
          </div>
          {tempo && Number(tempo.amostra) > 0 ? (
            <div className="space-y-4">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">
                  {Number(tempo.dias_medio_ate_fechar).toFixed(1)}d
                </div>
                <div className="text-xs text-muted-foreground">Média de dias até fechar</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {Number(tempo.dias_mediano_ate_fechar).toFixed(1)}d
                </div>
                <div className="text-xs text-muted-foreground">Mediana (metade dos leads)</div>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Baseado em {Number(tempo.amostra)} vendas fechadas
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-12">
              Ainda sem vendas fechadas pra calcular tempo médio.
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border rounded-xl p-5 shadow-card"
      >
        <div className="mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Quando os leads chegam
          </h3>
          <p className="text-xs text-muted-foreground">Últimos 90 dias · dia da semana × hora do dia</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex gap-0.5 mb-1">
              <div className="w-10 shrink-0" />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">{h}</div>
              ))}
            </div>
            {[1, 2, 3, 4, 5, 6, 0].map((dia) => (
              <div key={dia} className="flex gap-0.5 mb-0.5">
                <div className="w-10 shrink-0 text-[11px] text-muted-foreground flex items-center">{DIAS_SEMANA[dia]}</div>
                {Array.from({ length: 24 }, (_, h) => {
                  const count = heatCell(dia, h);
                  const intensity = heatmapMax > 0 ? count / heatmapMax : 0;
                  return (
                    <div
                      key={h}
                      className="flex-1 aspect-square rounded-sm transition-all hover:scale-110"
                      style={{
                        backgroundColor: count === 0 ? "hsl(var(--muted))" : `hsl(24 95% ${Math.max(40, 90 - intensity * 45)}%)`,
                      }}
                      title={`${DIAS_SEMANA[dia]} ${h}h: ${count} leads`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
          <span>Menos</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((i) => (
              <div key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: `hsl(24 95% ${Math.max(40, 90 - i * 45)}%)` }} />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border rounded-xl shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Performance detalhada
            </h3>
            <p className="text-xs text-muted-foreground">Drill-down por nível do anúncio</p>
          </div>
          <div className="flex bg-muted/60 rounded-lg p-1 border">
            {(["campanhas", "adsets", "ads"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAba(a)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                  aba === a ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {a === "ads" ? "Anúncios" : a}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  {aba === "campanhas" ? "Campanha" : aba === "adsets" ? "Grupo de anúncios" : "Anúncio"}
                </th>
                <th className="text-right px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">Leads</th>
                <th className="text-right px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">Fechados</th>
                <th className="text-right px-3 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">Conv.</th>
                <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wider">Receita</th>
              </tr>
            </thead>
            <tbody>
              {dataAba.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8 text-sm">Sem dados nesse nível.</td>
                </tr>
              )}
              {dataAba.map((item: any, idx: number) => {
                const nome = item.campanha_nome ?? item.adset_nome ?? item.ad_nome ?? "—";
                const leads = Number(item.total_leads) || 0;
                const fechadosI = Number(item.fechados) || 0;
                const conv = Number(item.conv_pct ?? item.taxa_conversao_pct) || 0;
                const receita = Number(item.valor_total ?? item.receita) || 0;
                const maxLeads = Math.max(...dataAba.map((x: any) => Number(x.total_leads) || 0), 1);
                const barPct = (leads / maxLeads) * 100;
                return (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 max-w-[280px]">
                      <div className="font-medium text-sm truncate">{nome.replace(/[🔴🟢🔵⚫]/g, "").trim()}</div>
                      {aba !== "campanhas" && (item.campanha_nome || item.adset_nome) && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {aba === "adsets" ? item.campanha_nome : `${item.campanha_nome} · ${item.adset_nome}`}
                        </div>
                      )}
                      <div className="h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ delay: 0.4 + idx * 0.02 }}
                          className="h-full bg-gradient-brand rounded-full"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-medium">{leads.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2.5 text-right text-sm">{fechadosI}</td>
                    <td className="px-3 py-2.5 text-right text-xs">
                      <span className={cn(
                        "inline-flex px-1.5 py-0.5 rounded-full font-semibold",
                        conv >= 10 ? "bg-emerald-500/10 text-emerald-600" :
                        conv >= 3 ? "bg-amber-500/10 text-amber-600" :
                        "bg-muted text-muted-foreground",
                      )}>
                        {conv}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-emerald-600">
                      {receita > 0 ? formatCurrency(receita) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {porFormulario.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-xl p-5 shadow-card"
        >
          <div className="mb-4">
            <h3 className="font-semibold">Performance por formulário</h3>
            <p className="text-xs text-muted-foreground">Cada aba do Sheets representa uma fonte de leads</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={porFormulario.map((f: any) => ({
                nome: (f.formulario ?? "—").trim(),
                leads: Number(f.total_leads) || 0,
                fechados: Number(f.fechados) || 0,
              }))}
              margin={{ top: 5, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="nome" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
              <Bar dataKey="leads" fill="hsl(24 95% 53%)" radius={[6, 6, 0, 0]} name="Leads" />
              <Bar dataKey="fechados" fill="hsl(145 70% 45%)" radius={[6, 6, 0, 0]} name="Fechados" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
