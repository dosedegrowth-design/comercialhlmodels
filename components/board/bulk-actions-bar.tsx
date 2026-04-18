"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/utils";
import type { LeadStatus } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";

export function BulkActionsBar({
  selectedIds,
  onClear,
  onOpenDistribuir,
}: {
  selectedIds: string[];
  onClear: () => void;
  onOpenDistribuir?: () => void;
}) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function handleChangeStatus(status: string) {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("marcar_leads_em_massa", {
        p_lead_ids: selectedIds,
        p_novo_status: status as LeadStatus,
        p_observacao: null,
      });
      if (error) throw error;
      const total = (data as any)?.atualizados ?? 0;
      toast.success(`${total} leads marcados como ${STATUS_LABELS[status as LeadStatus]}`);
      qc.invalidateQueries({ queryKey: ["leads"] });
      onClear();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border shadow-card-hover rounded-xl px-4 py-3 flex items-center gap-3 max-w-2xl w-[calc(100%-2rem)]"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? "lead selecionado" : "leads selecionados"}
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          <Select onValueChange={handleChangeStatus} disabled={loading}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Mudar status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDER.filter((s) => s !== "fechado").map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onOpenDistribuir && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenDistribuir}
              className="gap-1.5 h-8 text-xs"
            >
              <Users className="w-3 h-3" />
              Distribuir
            </Button>
          )}

          <div className="ml-auto">
            <Button size="sm" variant="ghost" onClick={onClear} className="h-8">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
