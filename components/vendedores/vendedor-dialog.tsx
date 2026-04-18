"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateVendedor, useUpdateVendedor } from "@/lib/hooks/use-vendedores";
import { toast } from "sonner";
import type { Vendedor } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  vendedor?: Vendedor | null;
}

export function VendedorDialog({ open, onClose, vendedor }: Props) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    peso_distribuicao: 1,
    max_leads_por_dia: "",
  });

  const create = useCreateVendedor();
  const update = useUpdateVendedor();

  useEffect(() => {
    if (vendedor) {
      setForm({
        nome: vendedor.nome,
        telefone: vendedor.telefone ?? "",
        email: vendedor.email ?? "",
        peso_distribuicao: vendedor.peso_distribuicao,
        max_leads_por_dia: vendedor.max_leads_por_dia?.toString() ?? "",
      });
    } else {
      setForm({ nome: "", telefone: "", email: "", peso_distribuicao: 1, max_leads_por_dia: "" });
    }
  }, [vendedor, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      telefone: form.telefone.trim() || null,
      email: form.email.trim() || null,
      peso_distribuicao: Number(form.peso_distribuicao) || 1,
      max_leads_por_dia: form.max_leads_por_dia ? Number(form.max_leads_por_dia) : null,
    };

    if (vendedor) {
      toast.promise(update.mutateAsync({ id: vendedor.id, ...payload }), {
        loading: "Atualizando...",
        success: "Vendedor atualizado",
        error: (e) => e.message,
      });
    } else {
      toast.promise(create.mutateAsync(payload), {
        loading: "Criando vendedor...",
        success: `${payload.nome} criado com sucesso`,
        error: (e) => e.message,
      });
    }

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vendedor ? "Editar vendedor" : "Novo vendedor"}</DialogTitle>
          <DialogDescription>
            {vendedor ? "Atualize os dados do vendedor" : "Cadastre um novo membro da equipe comercial"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome *</label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Telefone</label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="11999998888"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vendedor@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Peso de distribuição</label>
              <Input
                type="number"
                min="1"
                value={form.peso_distribuicao}
                onChange={(e) => setForm({ ...form, peso_distribuicao: Number(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Pesos maiores recebem mais leads</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Limite diário</label>
              <Input
                type="number"
                min="0"
                value={form.max_leads_por_dia}
                onChange={(e) => setForm({ ...form, max_leads_por_dia: e.target.value })}
                placeholder="Ilimitado"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Deixe vazio para ilimitado</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-brand text-white hover:opacity-90">
              {vendedor ? "Salvar" : "Criar vendedor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
