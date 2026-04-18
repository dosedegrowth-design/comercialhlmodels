"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateLead } from "@/lib/hooks/use-leads";
import { CheckCircle2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/types/database";

const FORMAS_PAGAMENTO = ["Pix", "Cartão de Crédito", "Boleto", "Transferência", "Dinheiro", "Parcelado"];

export function FecharVendaDialog({
  lead,
  open,
  onClose,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}) {
  const update = useUpdateLead();
  const [valor, setValor] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [formaPagamento, setFormaPagamento] = useState<string>("");
  const [produto, setProduto] = useState<string>("");
  const [obs, setObs] = useState<string>("");

  useEffect(() => {
    if (open && lead) {
      setValor(lead.valor_fechamento?.toString() ?? "");
      setData(lead.data_fechamento?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
      setFormaPagamento(lead.forma_pagamento ?? "");
      setProduto(lead.produto_servico ?? "");
      setObs(lead.observacao_fechamento ?? "");
    }
  }, [open, lead]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;
    const valorNum = valor ? Number(valor.replace(",", ".")) : null;
    if (valor && (isNaN(valorNum!) || valorNum! < 0)) {
      toast.error("Valor inválido");
      return;
    }

    toast.promise(
      update.mutateAsync({
        id: lead.id,
        status: "fechado",
        valor_fechamento: valorNum,
        data_fechamento: data ? new Date(data + "T12:00:00").toISOString() : new Date().toISOString(),
        forma_pagamento: formaPagamento || null,
        produto_servico: produto.trim() || null,
        observacao_fechamento: obs.trim() || null,
      }),
      {
        loading: "Registrando venda...",
        success: `🎉 Venda registrada${valorNum ? ` — ${valorNum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}`,
        error: (e) => e.message,
      },
    );

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            Registrar venda fechada
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da venda. Eles serão sincronizados com o Google Sheets e alimentam o Pixel do Facebook com valor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Valor da venda (R$) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="1250,00"
                required
                className="text-lg font-semibold"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Data do fechamento</label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Forma de pagamento</label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((fp) => (
                    <SelectItem key={fp} value={fp}>{fp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Produto / Serviço vendido</label>
            <Input
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              placeholder="ex: Book fotográfico completo"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Observações</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Detalhes do acordo, parcelamento, prazo de entrega..."
              className="w-full min-h-[80px] p-3 text-sm bg-background rounded-md border focus-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-gradient-brand text-white hover:opacity-90 gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Registrar venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
