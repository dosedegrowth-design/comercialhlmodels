"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFilters } from "@/components/leads/lead-filters";
import { KanbanBoard } from "@/components/board/kanban-board";
import { LeadsTable } from "@/components/board/leads-table";
import { LeadDrawer } from "@/components/board/lead-drawer";
import { useLeads, type LeadsFilter } from "@/lib/hooks/use-leads";
import { exportLeadsCSV } from "@/lib/utils/export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BoardClient() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<LeadsFilter>({ pageSize: 500 });
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const { data, isLoading } = useLeads(filters);
  const leads = data?.leads ?? [];

  function handleExport() {
    if (leads.length === 0) {
      toast.warning("Nenhum lead para exportar");
      return;
    }
    exportLeadsCSV(leads);
    toast.success(`${leads.length} leads exportados`);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4 border-b bg-card/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 flex-wrap gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Board <span className="text-gradient">Comercial</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {data?.total ?? 0} {(data?.total ?? 0) === 1 ? "lead" : "leads"} no total
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all",
                  view === "kanban" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all",
                  view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Exportar
            </Button>
          </div>
        </motion.div>

        <LeadFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "kanban" ? (
            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <KanbanBoard leads={leads} isLoading={isLoading} onOpen={setOpenLeadId} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-6 overflow-auto scrollbar-thin">
              <LeadsTable leads={leads} isLoading={isLoading} onOpen={setOpenLeadId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LeadDrawer leadId={openLeadId} onClose={() => setOpenLeadId(null)} />
    </div>
  );
}
