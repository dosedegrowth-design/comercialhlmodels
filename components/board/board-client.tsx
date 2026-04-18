"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFilters } from "@/components/leads/lead-filters";
import { KanbanBoard } from "@/components/board/kanban-board";
import { LeadsTable } from "@/components/board/leads-table";
import { LeadDrawer } from "@/components/board/lead-drawer";
import { DistribuirDialog } from "@/components/vendedores/distribuir-dialog";
import { BulkActionsBar } from "@/components/board/bulk-actions-bar";
import { useLeads, type LeadsFilter } from "@/lib/hooks/use-leads";
import { exportLeadsCSV } from "@/lib/utils/export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BoardClient() {
  const searchParams = useSearchParams();
  const abaParam = searchParams.get("aba");

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<LeadsFilter>({ pageSize: 500 });
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [distribuirOpen, setDistribuirOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelectedIds((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]));
  }

  function toggleAll() {
    if (selectedIds.length === leads.length) setSelectedIds([]);
    else setSelectedIds(leads.map((l) => l.id));
  }

  // Sync do filtro origem_sheet_tab com query string (?aba=)
  useEffect(() => {
    if (abaParam && abaParam !== filters.origem_sheet_tab) {
      setFilters((f) => ({ ...f, origem_sheet_tab: abaParam, page: 0 }));
    } else if (!abaParam && filters.origem_sheet_tab) {
      setFilters((f) => ({ ...f, origem_sheet_tab: undefined, page: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaParam]);

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
      <div className="p-6 pb-4 border-b bg-card">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-5 flex-wrap gap-3"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Board Comercial
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.total ?? 0} {(data?.total ?? 0) === 1 ? "lead encontrado" : "leads encontrados"}
              {filters.origem_sheet_tab && (
                <> · Formulário <span className="font-medium text-foreground">{filters.origem_sheet_tab.trim()}</span></>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/60 rounded-lg p-1 border">
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-sm transition-all",
                  view === "kanban" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-sm transition-all",
                  view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Exportar
            </Button>

            <Button
              size="sm"
              onClick={() => setDistribuirOpen(true)}
              className="gap-1.5 bg-gradient-brand text-white hover:opacity-90"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Distribuir
            </Button>
          </div>
        </motion.div>

        <LeadFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="flex-1 overflow-hidden bg-muted/20">
        <AnimatePresence mode="wait">
          {view === "kanban" ? (
            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <KanbanBoard leads={leads} isLoading={isLoading} onOpen={setOpenLeadId} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-6 overflow-auto scrollbar-thin">
              <LeadsTable
                leads={leads}
                isLoading={isLoading}
                onOpen={setOpenLeadId}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LeadDrawer leadId={openLeadId} onClose={() => setOpenLeadId(null)} />
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onOpenDistribuir={() => setDistribuirOpen(true)}
      />
      <DistribuirDialog
        open={distribuirOpen}
        onClose={() => setDistribuirOpen(false)}
        initialFilter={{
          origem_sheet_tab: filters.origem_sheet_tab,
          campanha_id: filters.campanha_id,
        }}
      />
    </div>
  );
}
