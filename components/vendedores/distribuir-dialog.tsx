"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendedores, useDistribuirLeads, useLeadsSemVendedor } from "@/lib/hooks/use-vendedores";
import { useAbas, useCampanhas } from "@/lib/hooks/use-leads";
import { Sparkles, Users, Target } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DistribuirDialog({ open, onClose }: Props) {
  const { data: vendedores } = useVendedores(true);
  const { data: abas } = useAbas();
  const { data: campanhas } = useCampanhas();
  const { data: disponiveis } = useLeadsSemVendedor();
  const distribuir = useDistribuirLeads();

  const [vendedorId, setVendedorId] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(50);
  const [aba, setAba] = useState<string>("todas");
  const [campanhaId, setCampanhaId] = useState<string>("todas");
  const [observacao, setObservacao] = useState<string>("");

  async function handleDistribuir() {
    if (!vendedorId) {
      toast.error("Selecione um vendedor");
      return;
    }
    if (!quantidade || quantidade < 1) {
      toast.error("Quantidade inválida");
      return;
    }

    const filtros: Record<string, string> = {};
    if (aba !== "todas") filtros.origem_sheet_tab = aba;
    if (campanhaId !== "todas") filtros.campanha_id = campanhaId;

    toast.promise(
      distribuir.mutateAsync({
        vendedor_id: vendedorId,
        quantidade,
        filtros,
        observacao: observacao.trim() || undefined,
      }),
      {
        loading: "Distribuindo leads...",
        success: (data: any) =>
          `✨ ${data?.leads_atribuidos ?? 0} leads atribuídos ao vendedor`,
        error: (e) => `Erro: ${e.message}`,
      },
    );

    onClose();
    setVendedorId("");
    setQuantidade(50);
    setAba("todas");
    setCampanhaId("todas");
    setObservacao("");
  }

  const vendedorSelecionado = vendedores?.find((v) => v.id === vendedorId);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Distribuir leads
          </DialogTitle>
          <DialogDescription>
            Selecione o vendedor e filtros para atribuir leads automaticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quantidade disponível */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 border rounded-lg p-3 flex items-center gap-3"
          >
            <Target className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">{disponiveis ?? 0} leads disponíveis</div>
              <div className="text-xs text-muted-foreground">Sem vendedor atribuído</div>
            </div>
          </motion.div>

          {/* Vendedor */}
          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Vendedor
            </label>
            <Select value={vendedorId} onValueChange={setVendedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vendedor ativo" />
              </SelectTrigger>
              <SelectContent>
                {(vendedores ?? []).map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nome}
                  </SelectItem>
                ))}
                {(vendedores ?? []).length === 0 && (
                  <div className="p-2 text-xs text-muted-foreground">
                    Nenhum vendedor ativo. Cadastre primeiro.
                  </div>
                )}
              </SelectContent>
            </Select>
            {vendedorSelecionado?.max_leads_por_dia && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Limite diário configurado: {vendedorSelecionado.max_leads_por_dia} leads
              </p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Quantidade de leads</label>
            <Input
              type="number"
              min="1"
              max={disponiveis ?? 1000}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
            />
            <div className="flex gap-1 mt-2">
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuantidade(n)}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/70 transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros opcionais */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground uppercase tracking-wider">
                Formulário
              </label>
              <Select value={aba} onValueChange={setAba}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos</SelectItem>
                  {(abas ?? []).map((a) => (
                    <SelectItem key={a} value={a}>
                      {a.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground uppercase tracking-wider">
                Campanha
              </label>
              <Select value={campanhaId} onValueChange={setCampanhaId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {(campanhas ?? []).slice(0, 20).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="truncate max-w-[240px] inline-block">{c.nome}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Observação (opcional)</label>
            <Input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="ex: Lote para campanha X"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleDistribuir}
            disabled={!vendedorId || quantidade < 1}
            className="bg-gradient-brand text-white hover:opacity-90 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Distribuir {quantidade} leads
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
