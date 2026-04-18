"use client";

import { Phone, Mail, MessageSquare, Calendar } from "lucide-react";
import { HeatBadge } from "./heat-badge";
import { formatPhone, fromNow, whatsappLink } from "@/lib/utils";
import { calcLeadHeat } from "@/lib/utils/heat";
import type { Lead } from "@/types/database";
import { cn } from "@/lib/utils";

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-teal-500 to-cyan-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-green-500",
  "from-fuchsia-500 to-pink-500",
  "from-orange-500 to-red-500",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function LeadCardRich({
  lead,
  onOpen,
  dragHandleProps,
  isDragging = false,
}: {
  lead: Lead;
  onOpen?: () => void;
  dragHandleProps?: unknown;
  isDragging?: boolean;
}) {
  const heat = calcLeadHeat(lead);
  const gradIdx = hashString(lead.id) % AVATAR_GRADIENTS.length;
  const gradient = AVATAR_GRADIENTS[gradIdx];
  const inicial = (lead.nome ?? "?").trim().charAt(0).toUpperCase();
  const origem = lead.origem_sheet_tab?.trim() ?? "—";

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group bg-card border rounded-xl p-3.5 cursor-pointer transition-all",
        isDragging
          ? "shadow-xl rotate-1 scale-[1.02] border-primary/50"
          : "hover:shadow-card-hover hover:border-primary/30 shadow-soft",
      )}
    >
      {/* Top row: avatar + heat */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm",
            gradient,
          )}
        >
          {inicial || "?"}
        </div>
        <HeatBadge heat={heat} />
      </div>

      {/* Name + date */}
      <div className="mb-2.5">
        <div className="font-semibold text-sm leading-tight truncate">
          {lead.nome ?? "Sem nome"}
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
          <Calendar className="w-2.5 h-2.5" />
          {lead.lead_criado_em ? fromNow(lead.lead_criado_em) : fromNow(lead.created_at)}
        </div>
      </div>

      {/* Contact details */}
      <div className="space-y-1 mb-2.5 text-[11px]">
        {lead.telefone && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="w-3 h-3 shrink-0" />
            <span className="truncate">{formatPhone(lead.telefone)}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <div className="w-3 h-3 shrink-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          </div>
          <span className="truncate">{origem}</span>
        </div>
      </div>

      {/* Footer: actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {lead.telefone && (
            <a
              href={whatsappLink(lead.telefone) ?? "#"}
              target="_blank"
              rel="noopener"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-green-500/10 hover:text-green-600 text-muted-foreground transition-colors"
              title="WhatsApp"
            >
              <MessageSquare className="w-3 h-3" />
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground transition-colors"
              title="Email"
            >
              <Mail className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Vendor (se atribuído) */}
        {lead.vendedor_id && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
            <div className="w-4 h-4 rounded-full bg-gradient-brand text-white flex items-center justify-center text-[8px] font-bold">
              V
            </div>
            <span>Atribuído</span>
          </div>
        )}
      </div>
    </div>
  );
}
