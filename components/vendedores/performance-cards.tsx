"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import { useVendedorPerformance } from "@/lib/hooks/use-vendedores";

export function PerformanceCards() {
  const { data, isLoading } = useVendedorPerformance();

  if (isLoading) return null;

  const ativos = (data ?? []).filter((p: any) => p.ativo && Number(p.total_leads_recebidos) > 0);
  if (ativos.length === 0) return null;

  const maxLeads = Math.max(...ativos.map((p: any) => Number(p.total_leads_recebidos)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card border rounded-xl overflow-hidden"
    >
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Ranking de performance
          </h3>
          <p className="text-xs text-muted-foreground">Resultados dos vendedores ativos</p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {ativos.map((v: any, idx: number) => {
          const total = Number(v.total_leads_recebidos);
          const fechados = Number(v.fechados);
          const conversao = Number(v.taxa_conversao_pct) || 0;
          const pctBar = maxLeads > 0 ? (total / maxLeads) * 100 : 0;

          return (
            <motion.div
              key={v.vendedor_id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.04 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-500"
                        : idx === 1
                        ? "bg-gray-400/20 text-gray-400"
                        : idx === 2
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-medium text-sm">{v.vendedor_nome}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">
                    {fechados}/{total} fechados
                  </span>
                  <span className="font-semibold text-green-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {conversao}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pctBar}%` }}
                  transition={{ delay: 0.3 + idx * 0.05, duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-gradient-brand rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
