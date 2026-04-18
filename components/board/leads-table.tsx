"use client";

import { motion } from "framer-motion";
import { Phone, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/leads/status-badge";
import { formatPhone, fromNow, whatsappLink } from "@/lib/utils";
import type { Lead } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadsTable({
  leads,
  isLoading,
  onOpen,
}: {
  leads: Lead[];
  isLoading: boolean;
  onOpen: (id: string) => void;
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

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Lead</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Contato</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Campanha</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Origem</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(idx * 0.005, 0.3) }}
                onClick={() => onOpen(lead.id)}
                className="group border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{lead.nome ?? "Sem nome"}</div>
                  {lead.email && <div className="text-xs text-muted-foreground">{lead.email}</div>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {lead.telefone && (
                      <>
                        <span>{formatPhone(lead.telefone)}</span>
                        <a
                          href={whatsappLink(lead.telefone) ?? "#"}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-green-500/20 hover:text-green-500 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                  {lead.campanha_nome?.replace(/[🔴🟢🔵⚫]/g, "").trim() ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {lead.origem_sheet_tab?.trim() ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {lead.lead_criado_em ? fromNow(lead.lead_criado_em) : "—"}
                </td>
                <td className="px-4 py-3">
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
