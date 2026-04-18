"use client";

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { cn, STATUS_LABELS } from "@/lib/utils";
import { useUpdateLeadStatus } from "@/lib/hooks/use-leads";
import { LeadCardRich } from "@/components/leads/lead-card-rich";
import type { Lead, LeadStatus } from "@/types/database";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS: { id: LeadStatus; dot: string }[] = [
  { id: "novo", dot: "bg-blue-500" },
  { id: "contato_feito", dot: "bg-amber-500" },
  { id: "qualificado", dot: "bg-purple-500" },
  { id: "agendado", dot: "bg-cyan-500" },
  { id: "fechado", dot: "bg-emerald-500" },
  { id: "perdido", dot: "bg-red-500" },
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
      loading: "Atualizando...",
      success: `Movido para ${STATUS_LABELS[newStatus]}`,
      error: (e) => `Erro: ${e.message}`,
    });
  }

  if (isLoading) {
    return (
      <div className="h-full flex gap-4 p-6 overflow-x-auto scrollbar-thin">
        {COLUMNS.map((c) => (
          <div key={c.id} className="w-[320px] shrink-0 space-y-3">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex gap-4 p-6 overflow-x-auto scrollbar-thin">
        {COLUMNS.map((col, colIdx) => {
          const items = grouped[col.id] ?? [];
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.04 }}
              className="w-[320px] shrink-0 flex flex-col max-h-full"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.dot)} />
                  <h3 className="font-semibold text-sm">{STATUS_LABELS[col.id]}</h3>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                    {items.length}
                  </span>
                </div>
                <button className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 space-y-2.5 p-2 rounded-xl transition-colors overflow-y-auto scrollbar-thin",
                      snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/30" : "bg-muted/30",
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
                          >
                            <LeadCardRich lead={lead} onOpen={() => onOpen(lead.id)} isDragging={s.isDragging} />
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
