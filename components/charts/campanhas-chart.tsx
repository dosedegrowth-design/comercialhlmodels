"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = [
  "hsl(262 80% 60%)", "hsl(290 75% 60%)", "hsl(330 80% 60%)", "hsl(350 75% 60%)",
  "hsl(20 85% 60%)", "hsl(45 90% 55%)", "hsl(145 70% 50%)", "hsl(180 75% 50%)",
  "hsl(210 85% 60%)", "hsl(240 70% 65%)",
];

export function CampanhasChart({ data }: { data: any[] }) {
  const chartData = (data ?? []).map((c) => ({
    nome: (c.campanha_nome ?? "—").toString().replace(/[🔴🟢🔵⚫]/g, "").trim().slice(0, 40),
    leads: Number(c.total_leads) || 0,
    fechados: Number(c.fechados) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
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
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
        />
        <Bar dataKey="leads" radius={[0, 6, 6, 0]} name="Leads">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
