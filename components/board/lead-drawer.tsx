"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, Clock, Tag, Target, MessageSquare, Activity, DollarSign, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/leads/status-badge";
import { FecharVendaDialog } from "@/components/leads/fechar-venda-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLead, useStatusHistory, useUpdateLead, useUpdateLeadStatus } from "@/lib/hooks/use-leads";
import { STATUS_LABELS, STATUS_ORDER, formatDateTime, formatPhone, fromNow, whatsappLink, formatCurrency } from "@/lib/utils";
import type { LeadStatus } from "@/types/database";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function LeadDrawer({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  const { data: lead } = useLead(leadId);
  const { data: history } = useStatusHistory(leadId);
  const updateStatus = useUpdateLeadStatus();
  const updateLead = useUpdateLead();
  const [obs, setObs] = useState("");
  const [fecharOpen, setFecharOpen] = useState(false);

  useEffect(() => {
    setObs(lead?.observacoes ?? "");
  }, [lead]);

  const open = !!leadId;

  function handleStatusChange(status: LeadStatus) {
    if (!lead) return;
    // Se for mudança pra fechado, abre dialog de venda em vez de só mudar status
    if (status === "fechado" && lead.status !== "fechado") {
      setFecharOpen(true);
      return;
    }
    toast.promise(updateStatus.mutateAsync({ id: lead.id, status }), {
      loading: "Atualizando...",
      success: `Status: ${STATUS_LABELS[status]}`,
      error: (e) => e.message,
    });
  }

  function handleSaveObs() {
    if (!lead) return;
    if ((lead.observacoes ?? "") === obs) return;
    toast.promise(updateLead.mutateAsync({ id: lead.id, observacoes: obs }), {
      loading: "Salvando...",
      success: "Observação salva",
      error: (e) => e.message,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l shadow-2xl z-50 flex flex-col"
          >
            <div className="relative p-6 border-b bg-gradient-to-br from-primary/5 via-transparent to-card overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-brand opacity-10 blur-3xl rounded-full" />
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-muted transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              {lead && (
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-brand text-white flex items-center justify-center text-xl font-bold shadow-lg glow-sm">
                    {(lead.nome ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold truncate">{lead.nome ?? "Sem nome"}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                      {lead.telefone && <span>{formatPhone(lead.telefone)}</span>}
                      {lead.email && (
                        <>
                          <span>•</span>
                          <span className="truncate">{lead.email}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <StatusBadge status={lead.status} />
                      <Select value={lead.status} onValueChange={(v) => handleStatusChange(v as LeadStatus)}>
                        <SelectTrigger className="h-7 w-[160px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_ORDER.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
              {lead && (
                <>
                  <div className="flex gap-2">
                    {lead.telefone && (
                      <Button asChild variant="outline" className="flex-1 gap-2">
                        <a href={whatsappLink(lead.telefone) ?? "#"} target="_blank" rel="noopener">
                          <Phone className="w-4 h-4 text-green-500" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    {lead.email && (
                      <Button asChild variant="outline" className="flex-1 gap-2">
                        <a href={`mailto:${lead.email}`}>
                          <Mail className="w-4 h-4 text-blue-500" />
                          Email
                        </a>
                      </Button>
                    )}
                  </div>

                  {lead.status === "fechado" && lead.valor_fechamento != null && (
                    <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Valor da venda</div>
                            <div className="text-xl font-bold text-emerald-600">{formatCurrency(lead.valor_fechamento)}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setFecharOpen(true)}>
                          Editar
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5 pt-2 border-t border-emerald-500/20">
                        {lead.data_fechamento && <div>Fechada em {formatDateTime(lead.data_fechamento)}</div>}
                        {lead.produto_servico && <div>Produto: {lead.produto_servico}</div>}
                        {lead.forma_pagamento && <div>Pagamento: {lead.forma_pagamento}</div>}
                        {lead.observacao_fechamento && <div className="italic">"{lead.observacao_fechamento}"</div>}
                      </div>
                    </section>
                  )}

                  {lead.status !== "fechado" && (
                    <Button
                      onClick={() => setFecharOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Registrar venda fechada
                    </Button>
                  )}

                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Target className="w-3 h-3" />
                      Origem da campanha
                    </h3>
                    <div className="space-y-2 text-sm bg-muted/30 rounded-lg p-3">
                      {lead.campanha_nome && <div><strong>Campanha:</strong> {lead.campanha_nome}</div>}
                      {lead.adset_nome && <div><strong>Grupo:</strong> {lead.adset_nome}</div>}
                      {lead.ad_nome && <div><strong>Anúncio:</strong> {lead.ad_nome}</div>}
                      {lead.platform && <div><strong>Plataforma:</strong> {lead.platform}</div>}
                      {lead.origem_sheet_tab && <div><strong>Formulário:</strong> {lead.origem_sheet_tab.trim()}</div>}
                    </div>
                  </section>

                  {lead.dados_extras && Object.keys(lead.dados_extras as any).length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        Dados do formulário
                      </h3>
                      <div className="space-y-1.5 text-sm bg-muted/30 rounded-lg p-3">
                        {Object.entries(lead.dados_extras as Record<string, string>).filter(([, v]) => v).map(([k, v]) => (
                          <div key={k} className="grid grid-cols-[1fr_2fr] gap-2">
                            <span className="text-muted-foreground text-xs">{k}:</span>
                            <span className="text-xs break-words">{v}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" />
                      Observações
                    </h3>
                    <textarea
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                      onBlur={handleSaveObs}
                      placeholder="Anote aqui informações do contato..."
                      className="w-full min-h-[100px] p-3 text-sm bg-muted/30 rounded-lg border focus-ring resize-none"
                    />
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Histórico
                    </h3>
                    <div className="space-y-2">
                      {(history ?? []).slice(0, 8).map((h) => (
                        <div key={h.id} className="flex items-start gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {h.status_anterior && (
                                <>
                                  <StatusBadge status={h.status_anterior} className="text-[10px] py-0" />
                                  <span className="text-muted-foreground text-xs">→</span>
                                </>
                              )}
                              <StatusBadge status={h.status_novo} className="text-[10px] py-0" />
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDateTime(h.alterado_em)} · {fromNow(h.alterado_em)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!history || history.length === 0) && (
                        <p className="text-xs text-muted-foreground">Sem mudanças registradas.</p>
                      )}
                    </div>
                  </section>

                  <div className="text-[10px] text-muted-foreground pt-4 border-t flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Criado {lead.lead_criado_em ? fromNow(lead.lead_criado_em) : fromNow(lead.created_at)}
                  </div>
                </>
              )}
            </div>
          </motion.aside>

          <FecharVendaDialog lead={lead ?? null} open={fecharOpen} onClose={() => setFecharOpen(false)} />
        </>
      )}
    </AnimatePresence>
  );
}
