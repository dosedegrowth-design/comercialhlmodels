"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function LeadsChart({ data }: { data: any[] }) {
  const chartData = [...(data ?? [])]
    .reverse()
    .map((d) => ({
      dia: d.dia,
      total: Number(d.total) || 0,
      fechados: Number(d.fechados) || 0,
      label: format(parseISO(d.dia), "dd/MM", { locale: ptBR }),
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(262 80% 60%)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(262 80% 60%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradFechados" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(145 70% 45%)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(145 70% 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(262 80% 60%)"
          strokeWidth={2}
          fill="url(#gradTotal)"
          name="Total"
        />
        <Area
          type="monotone"
          dataKey="fechados"
          stroke="hsl(145 70% 45%)"
          strokeWidth={2}
          fill="url(#gradFechados)"
          name="Fechados"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
