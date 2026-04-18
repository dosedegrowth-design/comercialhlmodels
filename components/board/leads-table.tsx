"use client";

import { motion } from "framer-motion";
import { Phone, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/leads/status-badge";
import { HeatBadge } from "@/components/leads/heat-badge";
import { calcLeadHeat } from "@/lib/utils/heat";
import { formatPhone, fromNow, whatsappLink, formatCurrency, cn } from "@/lib/utils";
import type { Lead } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadsTable({
  leads,
  isLoading,
  onOpen,
  selectedIds,
  onToggleSelect,
  onToggleAll,
}: {
  leads: Lead[];
  isLoading: boolean;
  onOpen: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum lead encontrado com os filtros atuais.</p>
      </div>
    );
  }

  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.includes(l.id));
  const someSelected = !allSelected && leads.some((l) => selectedIds.includes(l.id));

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="w-10 pl-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onToggleAll}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                />
              </th>
              <th className="text-left px-3 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Lead</th>
              <th className="text-left px-3 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Contato</th>
              <th className="text-left px-3 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-3 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Heat</th>
              <th className="text-left px-3 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Origem</th>
              <th className="text-right px-3 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Valor</th>
              <th className="text-left px-3 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => {
              const isSelected = selectedIds.includes(lead.id);
              const heat = calcLeadHeat(lead);
              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(idx * 0.005, 0.3) }}
                  className={cn(
                    "group border-b last:border-0 transition-colors",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/30",
                  )}
                >
                  <td className="pl-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3 cursor-pointer" onClick={() => onOpen(lead.id)}>
                    <div className="font-medium">{lead.nome ?? "Sem nome"}</div>
                    {lead.email && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{lead.email}</div>}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {lead.telefone && (
                        <>
                          <span className="text-xs">{formatPhone(lead.telefone)}</span>
                          <a
                            href={whatsappLink(lead.telefone) ?? "#"}
                            target="_blank"
                            rel="noopener"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded hover:bg-green-500/20 hover:text-green-600 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 cursor-pointer" onClick={() => onOpen(lead.id)}>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-3 py-3 cursor-pointer" onClick={() => onOpen(lead.id)}>
                    <HeatBadge heat={heat} />
                  </td>
                  <td className="px-3 py-3 text-xs cursor-pointer" onClick={() => onOpen(lead.id)}>
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {lead.origem_sheet_tab?.trim() ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right cursor-pointer" onClick={() => onOpen(lead.id)}>
                    {lead.valor_fechamento != null ? (
                      <span className="font-semibold text-emerald-600 text-xs">
                        {formatCurrency(lead.valor_fechamento)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground cursor-pointer" onClick={() => onOpen(lead.id)}>
                    {lead.lead_criado_em ? fromNow(lead.lead_criado_em) : "—"}
                  </td>
                  <td className="px-3 py-3 cursor-pointer" onClick={() => onOpen(lead.id)}>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
