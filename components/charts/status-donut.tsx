"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function StatusDonut({ kpis }: { kpis: any }) {
  const data = [
    { name: "Novos", value: Number(kpis?.total_novos ?? 0), color: "hsl(210 90% 55%)" },
    { name: "Contato", value: Number(kpis?.total_contato ?? 0), color: "hsl(45 95% 55%)" },
    { name: "Qualificados", value: Number(kpis?.total_qualificados ?? 0), color: "hsl(262 80% 60%)" },
    { name: "Agendados", value: Number(kpis?.total_agendados ?? 0), color: "hsl(180 75% 45%)" },
    { name: "Fechados", value: Number(kpis?.total_fechados ?? 0), color: "hsl(145 70% 45%)" },
    { name: "Perdidos", value: Number(kpis?.total_perdidos ?? 0), color: "hsl(0 70% 55%)" },
  ].filter((d) => d.value > 0);

  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl font-bold">{total.toLocaleString("pt-BR")}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
        {data.slice(0, 6).map((d) => (
          <div key={d.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
            <span className="text-muted-foreground truncate">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
