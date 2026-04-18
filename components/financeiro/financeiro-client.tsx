"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingCart, Award, Calendar, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDateTime, cn } from "@/lib/utils";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  kpis: any;
  porCampanha: any[];
  porVendedor: any[];
  porDia: any[];
  porFormulario: any[];
  ultimasVendas: any[];
}

const PERIODS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "all", label: "Todo o período" },
];

const COLORS = [
  "hsl(24 95% 53%)", "hsl(18 85% 42%)", "hsl(38 95% 50%)", "hsl(45 95% 55%)",
  "hsl(12 90% 55%)", "hsl(28 85% 48%)", "hsl(6 85% 55%)", "hsl(35 80% 45%)",
];

export function FinanceiroClient({ kpis, porCampanha, porVendedor, porDia, porFormulario, ultimasVendas }: Props) {
  const [period, setPeriod] = useState("30");
  const [formFilter, setFormFilter] = useState("all");

  const receita = Number(kpis?.receita_total ?? 0);
  const ticket = Number(kpis?.ticket_medio ?? 0);
  const fechadas = Number(kpis?.total_fechados ?? 0);
  const taxa = Number(kpis?.taxa_conversao_pct ?? 0);

  const porDiaFiltered = useMemo(() => {
    const data = [...porDia].reverse();
    if (period === "all") return data;
    const days = Number(period);
    return data.slice(-days);
  }, [porDia, period]);

  const chartPorDia = porDiaFiltered.map((d) => ({
    label: format(parseISO(d.dia), "dd/MM", { locale: ptBR }),
    receita: Number(d.receita) || 0,
    vendas: Number(d.vendas) || 0,
  }));

  const chartCampanhas = porCampanha.slice(0, 8).map((c) => ({
    nome: (c.campanha_nome ?? "—").replace(/[🔴🟢🔵⚫]/g, "").trim().slice(0, 35),
    receita: Number(c.valor_total) || 0,
    fechados: Number(c.fechados) || 0,
  }));

  const vendasFiltradas = formFilter === "all"
    ? ultimasVendas
    : ultimasVendas.filter((v) => v.origem_sheet_tab === formFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Financeiro <span className="text-gradient">Comercial</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Receita, ticket médio e desempenho por campanha.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] h-9">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* KPIs financeiros */}
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
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Receita total</span>
              <DollarSign className="w-4 h-4 text-white/80" />
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(receita)}</div>
            <div className="text-xs text-white/80">{fechadas} {fechadas === 1 ? "venda fechada" : "vendas fechadas"}</div>
          </div>
        </motion.div>

        {[
          { label: "Ticket médio", value: formatCurrency(ticket), icon: ShoppingCart, color: "hsl(24 95% 53%)", bg: "bg-orange-500/10" },
          { label: "Vendas fechadas", value: fechadas.toLocaleString("pt-BR"), icon: Award, color: "hsl(145 70% 45%)", bg: "bg-emerald-500/10" },
          { label: "Taxa de conversão", value: `${taxa}%`, icon: TrendingUp, color: "hsl(210 90% 55%)", bg: "bg-blue-500/10" },
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
              <div className="text-2xl font-bold tracking-tight">{c.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Gráficos lado a lado */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-card border rounded-xl p-5 shadow-card min-h-[340px]"
        >
          <div className="mb-4">
            <h3 className="font-semibold">Receita por dia</h3>
            <p className="text-xs text-muted-foreground">
              {period === "all" ? "Todo o período" : `Últimos ${period} dias`}
            </p>
          </div>
          {chartPorDia.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              Nenhuma venda registrada no período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartPorDia} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(24 95% 53%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(24 95% 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: any, name: string) =>
                    name === "receita" ? [formatCurrency(value), "Receita"] : [value, "Vendas"]
                  }
                />
                <Area type="monotone" dataKey="receita" stroke="hsl(24 95% 53%)" strokeWidth={2} fill="url(#gradReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl shadow-card min-h-[340px] overflow-hidden"
        >
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top vendedores
            </h3>
            <p className="text-xs text-muted-foreground">Por receita gerada</p>
          </div>
          <div className="p-4 space-y-3">
            {porVendedor.filter((v: any) => Number(v.valor_total_vendido) > 0).slice(0, 5).map((v: any, idx: number) => {
              const total = Number(v.valor_total_vendido);
              const maxTotal = Math.max(...porVendedor.map((x: any) => Number(x.valor_total_vendido) || 0), 1);
              const pct = (total / maxTotal) * 100;
              return (
                <div key={v.vendedor_id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                        idx === 0 ? "bg-amber-500/20 text-amber-600" :
                        idx === 1 ? "bg-gray-400/20 text-gray-500" :
                        idx === 2 ? "bg-orange-500/20 text-orange-600" :
                        "bg-muted text-muted-foreground",
                      )}>{idx + 1}</div>
                      <span className="text-sm font-medium truncate">{v.vendedor_nome}</span>
                    </div>
                    <span className="text-xs font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + idx * 0.05, duration: 0.5 }}
                      className="h-full bg-gradient-brand rounded-full"
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {v.fechados} vendas · ticket {formatCurrency(Number(v.ticket_medio))}
                  </div>
                </div>
              );
            })}
            {porVendedor.filter((v: any) => Number(v.valor_total_vendido) > 0).length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-8">
                Nenhuma venda atribuída a vendedor ainda.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Receita por campanha */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border rounded-xl p-5 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Receita por campanha</h3>
            <p className="text-xs text-muted-foreground">Top campanhas com mais retorno</p>
          </div>
        </div>
        {chartCampanhas.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
            Nenhuma venda com campanha registrada.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartCampanhas} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                width={180}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(value: any) => [formatCurrency(value), "Receita"]}
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              />
              <Bar dataKey="receita" radius={[0, 6, 6, 0]}>
                {chartCampanhas.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Últimas vendas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border rounded-xl shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-semibold">Últimas vendas fechadas</h3>
            <p className="text-xs text-muted-foreground">{vendasFiltradas.length} vendas</p>
          </div>
          <Select value={formFilter} onValueChange={setFormFilter}>
            <SelectTrigger className="w-[200px] h-8">
              <Filter className="w-3 h-3 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos formulários</SelectItem>
              {porFormulario.map((f: any) => (
                <SelectItem key={f.formulario} value={f.formulario}>
                  {f.formulario.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Produto</th>
                <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Campanha</th>
                <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="text-right px-4 py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-8 text-sm">
                    Nenhuma venda encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
              {vendasFiltradas.map((v: any) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{v.nome ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{v.produto_servico ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs truncate max-w-[200px]">
                    {v.campanha_nome?.replace(/[🔴🟢🔵⚫]/g, "").trim() ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">
                    {v.data_fechamento ? formatDate(v.data_fechamento) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">
                    {formatCurrency(v.valor_fechamento)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
