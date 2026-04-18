"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Edit2, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendedorDialog } from "./vendedor-dialog";
import { useVendedores, useUpdateVendedor } from "@/lib/hooks/use-vendedores";
import { formatPhone } from "@/lib/utils";
import type { Vendedor } from "@/types/database";
import { toast } from "sonner";

export function VendedoresList() {
  const { data: vendedores, isLoading } = useVendedores();
  const update = useUpdateVendedor();
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);

  function toggleAtivo(v: Vendedor) {
    toast.promise(update.mutateAsync({ id: v.id, ativo: !v.ativo }), {
      loading: v.ativo ? "Desativando..." : "Ativando...",
      success: v.ativo ? `${v.nome} desativado` : `${v.nome} ativado`,
      error: (e) => e.message,
    });
  }

  if (isLoading) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border rounded-xl overflow-hidden"
      >
        <div className="px-5 py-3 border-b">
          <h3 className="font-semibold">Equipe de vendedores</h3>
          <p className="text-xs text-muted-foreground">
            {vendedores?.length ?? 0} {vendedores?.length === 1 ? "vendedor cadastrado" : "vendedores cadastrados"}
          </p>
        </div>

        {vendedores && vendedores.length > 0 ? (
          <div className="divide-y">
            {vendedores.map((v, idx) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold shrink-0">
                    {v.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{v.nome}</div>
                      {!v.ativo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {formatPhone(v.telefone) || v.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <div className="hidden md:flex items-center gap-3">
                    <span>Peso {v.peso_distribuicao}</span>
                    {v.max_leads_por_dia && <span>· {v.max_leads_por_dia}/dia</span>}
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => toggleAtivo(v)}>
                    {v.ativo ? (
                      <UserX className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-green-500" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingVendedor(v)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum vendedor cadastrado ainda.
            <br />
            Clique em <strong>Novo vendedor</strong> no topo para começar.
          </div>
        )}
      </motion.div>

      <VendedorDialog open={!!editingVendedor} onClose={() => setEditingVendedor(null)} vendedor={editingVendedor} />
    </>
  );
}
