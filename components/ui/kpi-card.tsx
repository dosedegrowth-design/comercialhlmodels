"use client";

import { motion } from "framer-motion";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  trend?: { value: number; positive?: boolean };
  delay?: number;
}

export function KPICard({ label, value, icon: Icon, gradient, trend, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-xl blur-xl transition-opacity" style={{ backgroundImage: gradient }} />
      <div className="relative bg-card border rounded-xl p-5 overflow-hidden">
        {/* Decorative gradient blob */}
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
          style={{ background: gradient }}
        />

        <div className="relative flex items-start justify-between mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md"
            style={{ background: gradient }}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="relative flex items-end justify-between gap-2">
          <motion.div
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-bold tracking-tight"
          >
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </motion.div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.positive !== false ? "text-green-500" : "text-red-500",
              )}
            >
              {trend.positive !== false ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
