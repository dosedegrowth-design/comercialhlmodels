"use client";

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Phone, Mail, Clock } from "lucide-react";
import { cn, STATUS_LABELS, fromNow, formatPhone, whatsappLink } from "@/lib/utils";
import { useUpdateLeadStatus } from "@/lib/hooks/use-leads";
import type { Lead, LeadStatus } from "@/types/database";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS: { id: LeadStatus; gradient: string }[] = [
  { id: "novo", gradient: "from-blue-500 to-cyan-500" },
  { id: "contato_feito", gradient: "from-amber-500 to-orange-500" },
  { id: "qualificado", gradient: "from-purple-500 to-pink-500" },
  { id: "agendado", gradient: "from-teal-500 to-cyan-500" },
  { id: "fechado", gradient: "from-green-500 to-emerald-500" },
  { id: "perdido", gradient: "from-red-500 to-rose-500" },
];

export function KanbanBoard({
  leads,
  isLoading,
  onOpen,
}: {
  leads: Lead[];
  isLoading: boolean;
  onOpen: (id: string) => void;
}) {
  const updateStatus = useUpdateLeadStatus();

  const grouped = useMemo(() => {
    const g: Record<string, Lead[]> = {};
    COLUMNS.forEach((c) => (g[c.id] = []));
    leads.forEach((l) => {
      if (g[l.status]) g[l.status].push(l);
    });
    return g;
  }, [leads]);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const leadId = result.draggableId;
    const newStatus = result.destination.droppableId as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    toast.promise(updateStatus.mutateAsync({ id: leadId, status: newStatus }), {
      loading: "Atualizando status...",
      success: `Movido para ${STATUS_LABELS[newStatus]}`,
      error: (e) => `Erro: ${e.message}`,
    });
  }

  if (isLoading) {
    return (
      <div className="h-full flex gap-3 p-6 overflow-x-auto scrollbar-thin">
        {COLUMNS.map((c) => (
          <div key={c.id} className="w-[300px] shrink-0 space-y-3">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex gap-3 p-6 overflow-x-auto scrollbar-thin">
        {COLUMNS.map((col, colIdx) => {
          const items = grouped[col.id] ?? [];
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.05 }}
              className="w-[300px] shrink-0 flex flex-col max-h-full"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full bg-gradient-to-br", col.gradient)} />
                  <h3 className="font-semibold text-sm">{STATUS_LABELS[col.id]}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {items.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 space-y-2 p-2 rounded-xl border-2 border-dashed transition-colors overflow-y-auto scrollbar-thin",
                      snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" : "border-transparent bg-muted/20",
                    )}
                  >
                    {items.map((lead, idx) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                        {(p, s) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            style={p.draggableProps.style}
                            onClick={() => onOpen(lead.id)}
                            className={cn(
                              "group bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all",
                              s.isDragging ? "shadow-2xl rotate-1 scale-105 border-primary" : "hover:shadow-md hover:border-primary/40",
                            )}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br text-white flex items-center justify-center text-xs font-semibold shrink-0", col.gradient)}>
                                {(lead.nome ?? "?").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{lead.nome ?? "Sem nome"}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {formatPhone(lead.telefone) || lead.email || "—"}
                                </div>
                              </div>
                            </div>

                            {lead.campanha_nome && (
                              <div className="text-[10px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 mb-2 truncate">
                                {lead.campanha_nome.replace(/[🔴🟢🔵⚫]/g, "").trim()}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lead.lead_criado_em ? fromNow(lead.lead_criado_em) : "—"}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {lead.telefone && (
                                  <a
                                    href={whatsappLink(lead.telefone) ?? "#"}
                                    target="_blank"
                                    rel="noopener"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded hover:bg-green-500/20 hover:text-green-500"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </a>
                                )}
                                {lead.email && (
                                  <a
                                    href={`mailto:${lead.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded hover:bg-blue-500/20 hover:text-blue-500"
                                  >
                                    <Mail className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center text-xs text-muted-foreground/60 py-8">Nenhum lead</div>
                    )}
                  </div>
                )}
              </Droppable>
            </motion.div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
