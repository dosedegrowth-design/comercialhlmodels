"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, UserPlus, TrendingUp, Target, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendedorDialog } from "./vendedor-dialog";
import { DistribuirDialog } from "./distribuir-dialog";
import { VendedoresList } from "./vendedores-list";
import { PerformanceCards } from "./performance-cards";
import {
  useVendedores,
  useVendedorPerformance,
  useLeadsSemVendedor,
} from "@/lib/hooks/use-vendedores";

export function VendedoresClient() {
  const [openNew, setOpenNew] = useState(false);
  const [openDistribuir, setOpenDistribuir] = useState(false);
  const { data: vendedores } = useVendedores();
  const { data: performance } = useVendedorPerformance();
  const { data: semVendedor } = useLeadsSemVendedor();

  const totalVendedores = vendedores?.length ?? 0;
  const ativos = vendedores?.filter((v) => v.ativo).length ?? 0;
  const totalDistribuidos = (performance ?? []).reduce(
    (acc: number, p: any) => acc + Number(p.total_leads_recebidos ?? 0),
    0,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Vendedores</span> & Distribuição
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie sua equipe comercial e distribua leads automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setOpenNew(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo vendedor
          </Button>
          <Button onClick={() => setOpenDistribuir(true)} className="gap-2 bg-gradient-brand text-white hover:opacity-90">
            <Plus className="w-4 h-4" />
            Distribuir leads
          </Button>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Total vendedores",
            value: totalVendedores,
            icon: UsersIcon,
            gradient: "linear-gradient(135deg, hsl(262 80% 60%), hsl(292 80% 60%))",
          },
          {
            label: "Ativos",
            value: ativos,
            icon: TrendingUp,
            gradient: "linear-gradient(135deg, hsl(145 70% 45%), hsl(165 70% 45%))",
          },
          {
            label: "Leads distribuídos",
            value: totalDistribuidos,
            icon: Target,
            gradient: "linear-gradient(135deg, hsl(210 90% 55%), hsl(190 85% 55%))",
          },
          {
            label: "Aguardando distribuição",
            value: semVendedor ?? 0,
            icon: Plus,
            gradient: "linear-gradient(135deg, hsl(45 95% 55%), hsl(30 95% 55%))",
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="relative bg-card border rounded-xl p-4 overflow-hidden group hover:border-primary/40 transition-colors"
            >
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
                style={{ background: c.gradient }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {c.label}
                  </div>
                  <div className="text-2xl font-bold">{c.value.toLocaleString("pt-BR")}</div>
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ background: c.gradient }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Performance cards */}
      <PerformanceCards />

      {/* Lista de vendedores */}
      <VendedoresList />

      <VendedorDialog open={openNew} onClose={() => setOpenNew(false)} />
      <DistribuirDialog open={openDistribuir} onClose={() => setOpenDistribuir(false)} />
    </div>
  );
}
