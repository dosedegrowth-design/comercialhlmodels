"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendedores, useLeadsSemVendedor } from "@/lib/hooks/use-vendedores";
import { useAbas, useCampanhas } from "@/lib/hooks/use-leads";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Target, Check, ChevronUp, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
  initialFilter?: {
    origem_sheet_tab?: string;
    campanha_id?: string;
  };
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500];
const STATUS_OPTIONS = [
  { value: "novo", label: "Novos" },
  { value: "contato_feito", label: "Em Contato" },
  { value: "qualificado", label: "Qualificados" },
];

export function DistribuirDialog({ open, onClose, initialFilter }: Props) {
  const { data: vendedores } = useVendedores(true);
  const { data: abas } = useAbas();
  const { data: campanhas } = useCampanhas();
  const { data: disponiveis } = useLeadsSemVendedor();
  const qc = useQueryClient();

  const [vendedorIds, setVendedorIds] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState<number>(50);
  const [aba, setAba] = useState<string>("todas");
  const [campanhaId, setCampanhaId] = useState<string>("todas");
  const [status, setStatus] = useState<string>("novo");
  const [ordem, setOrdem] = useState<"recentes" | "antigos">("antigos");
  const [observacao, setObservacao] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAba(initialFilter?.origem_sheet_tab ?? "todas");
      setCampanhaId(initialFilter?.campanha_id ?? "todas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggleVendedor(id: string) {
    setVendedorIds((curr) => (curr.includes(id) ? curr.filter((v) => v !== id) : [...curr, id]));
  }

  function selectAllVendedores() {
    setVendedorIds(vendedores?.map((v) => v.id) ?? []);
  }

  async function handleDistribuir() {
    if (vendedorIds.length === 0) {
      toast.error("Selecione pelo menos um vendedor");
      return;
    }
    if (!quantidade || quantidade < 1) {
      toast.error("Quantidade inválida");
      return;
    }

    setLoading(true);
    const filtros: Record<string, string> = {};
    if (aba !== "todas") filtros.origem_sheet_tab = aba;
    if (campanhaId !== "todas") filtros.campanha_id = campanhaId;
    if (status !== "todos") filtros.status = status;

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("distribuir_leads_massa", {
        p_vendedor_ids: vendedorIds,
        p_filtros: filtros,
        p_quantidade: quantidade,
        p_ordem: ordem,
        p_observacao: observacao.trim() || null,
      });
      if (error) throw error;

      const total = (data as any)?.total_atribuido ?? 0;
      toast.success(`✨ ${total} leads distribuídos entre ${vendedorIds.length} vendedor${vendedorIds.length > 1 ? "es" : ""}`);

      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leads-sem-vendedor"] });
      qc.invalidateQueries({ queryKey: ["vendedor-performance"] });

      onClose();
      setVendedorIds([]);
      setObservacao("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const perVendedor = vendedorIds.length > 0 ? Math.floor(quantidade / vendedorIds.length) : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-card">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Distribuir leads em massa
          </DialogTitle>
          <DialogDescription>
            Atribua múltiplos leads para um ou vários vendedores com divisão automática
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info bar */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold">{disponiveis ?? 0} leads disponíveis</div>
              <div className="text-xs text-muted-foreground">
                Sem vendedor atribuído · prontos para distribuição
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              1. Filtros (quais leads entram na distribuição)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Qualquer status</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={aba} onValueChange={setAba}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Formulário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos formulários</SelectItem>
                  {(abas ?? []).map((a) => (
                    <SelectItem key={a} value={a}>{a.trim()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={campanhaId} onValueChange={setCampanhaId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Campanha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas campanhas</SelectItem>
                  {(campanhas ?? []).slice(0, 30).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="truncate max-w-[240px] inline-block">{c.nome}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantidade + Ordem */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              2. Quantos leads distribuir
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Input
                type="number"
                min="1"
                max={disponiveis ?? 1000}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-[100px] h-9"
              />
              <span className="text-sm text-muted-foreground">leads · ordem:</span>
              <div className="flex bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setOrdem("antigos")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all",
                    ordem === "antigos" ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <ChevronDown className="w-3 h-3" /> Mais antigos primeiro
                </button>
                <button
                  onClick={() => setOrdem("recentes")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all",
                    ordem === "recentes" ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <ChevronUp className="w-3 h-3" /> Mais recentes primeiro
                </button>
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider self-center mr-1">
                Atalhos:
              </span>
              {QUICK_AMOUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuantidade(n)}
                  className={cn(
                    "text-xs px-3 py-1 rounded-full border transition-colors",
                    quantidade === n
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted hover:bg-muted/70 border-transparent",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Vendedores */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                3. Para quais vendedores {vendedorIds.length > 0 && `(${vendedorIds.length} selecionados)`}
              </div>
              {(vendedores ?? []).length > 0 && (
                <button
                  type="button"
                  onClick={selectAllVendedores}
                  className="text-xs text-primary hover:underline"
                >
                  Selecionar todos
                </button>
              )}
            </div>

            {(vendedores ?? []).length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                Nenhum vendedor ativo cadastrado.{" "}
                <a href="/vendedores" className="text-primary underline">
                  Cadastre um vendedor primeiro
                </a>
                .
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                {(vendedores ?? []).map((v) => {
                  const selected = vendedorIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVendedor(v.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all text-left",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {v.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{v.nome}</div>
                        <div className="text-[10px] text-muted-foreground">Peso {v.peso_distribuicao}</div>
                      </div>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {vendedorIds.length > 1 && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                Leads serão divididos proporcionalmente ao peso de cada vendedor (~{perVendedor} por vendedor)
              </div>
            )}
          </div>

          {/* Observação */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Observação (opcional)
            </label>
            <Input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="ex: Lote semana 15 / Campanha de Natal"
              className="h-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            {vendedorIds.length > 0 && quantidade > 0 && (
              <>
                Distribuir <strong className="text-foreground">{quantidade} leads</strong> para{" "}
                <strong className="text-foreground">{vendedorIds.length} vendedor{vendedorIds.length > 1 ? "es" : ""}</strong>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={handleDistribuir}
              disabled={loading || vendedorIds.length === 0 || quantidade < 1}
              className="bg-gradient-brand text-white hover:opacity-90 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "Distribuindo..." : `Distribuir ${quantidade} leads`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
