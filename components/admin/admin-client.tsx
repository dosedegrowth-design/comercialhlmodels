"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Zap, Layers, CheckCircle2, XCircle, AlertTriangle, FileSpreadsheet, RefreshCw, ExternalLink, ShieldCheck, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfig, useUpdateConfig, useSyncLogs } from "@/lib/hooks/use-admin";
import { useSyncNow, useLastSync } from "@/lib/hooks/use-sync";
import { formatDateTime, cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const CAPI_EVENTOS_DISPONIVEIS = [
  { value: "novo", label: "Lead (chegou)" },
  { value: "qualificado", label: "CompleteRegistration (qualificado)" },
  { value: "agendado", label: "Schedule (agendado)" },
  { value: "fechado", label: "Purchase (venda com valor)" },
];

export function AdminClient() {
  const { data: config } = useConfig();
  const updateConfig = useUpdateConfig();
  const { data: logs } = useSyncLogs();
  const syncNow = useSyncNow();
  const { data: lastSync } = useLastSync();

  const [blockedInput, setBlockedInput] = useState("");

  useEffect(() => {
    if (config) setBlockedInput((config.blocked_tabs ?? []).join(", "));
  }, [config]);

  async function toggleCAPI() {
    if (!config) return;
    toast.promise(updateConfig.mutateAsync({ capi_ativo: !config.capi_ativo }), {
      loading: "Atualizando...",
      success: config.capi_ativo ? "CAPI desativado" : "CAPI ativado",
      error: (e) => e.message,
    });
  }

  function toggleEvento(e: string) {
    if (!config) return;
    const current = config.capi_eventos ?? [];
    const next = current.includes(e) ? current.filter((x) => x !== e) : [...current, e];
    updateConfig.mutate({ capi_eventos: next });
  }

  function saveBlockedTabs() {
    const tabs = blockedInput.split(",").map((t) => t.trim()).filter(Boolean);
    toast.promise(updateConfig.mutateAsync({ blocked_tabs: tabs }), {
      loading: "Salvando...",
      success: `${tabs.length} abas bloqueadas configuradas`,
      error: (e) => e.message,
    });
  }

  async function handleSync() {
    toast.promise(syncNow.mutateAsync(), {
      loading: "Rodando sync...",
      success: (data: any) => `${data?.rows ?? 0} leads sincronizados`,
      error: (e) => e.message,
    });
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-gradient">Administração</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Integrações, sincronização e ajustes da operação.
          </p>
        </div>
      </motion.div>

      {/* CAPI Facebook */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border rounded-xl shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">Facebook Conversions API</h3>
              <p className="text-xs text-muted-foreground">
                Dispara eventos automáticos com valor quando lead avança no funil
              </p>
            </div>
          </div>
          <button
            onClick={toggleCAPI}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              config?.capi_ativo ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition",
                config?.capi_ativo ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className={cn(
            "rounded-lg p-3 flex items-start gap-3 border",
            config?.capi_ativo ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20",
          )}>
            {config?.capi_ativo ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              <div className="font-medium">
                {config?.capi_ativo ? "CAPI ativo" : "CAPI desativado"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {config?.capi_ativo
                  ? "Eventos serão disparados automaticamente para o Facebook quando os status selecionados mudarem."
                  : "Eventos NÃO estão sendo enviados ao Facebook. Ative abaixo depois de configurar Pixel + Token."}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Credenciais (configurar nos secrets do Supabase)
            </h4>
            <div className="space-y-2">
              {["FB_PIXEL_ID", "FB_CAPI_ACCESS_TOKEN", "FB_TEST_EVENT_CODE"].map((k) => (
                <div key={k} className="bg-muted/30 rounded-lg p-3 text-sm">
                  <div className="font-mono text-xs">{k}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {k === "FB_PIXEL_ID" && "ID do Pixel do Facebook (15-16 dígitos)"}
                    {k === "FB_CAPI_ACCESS_TOKEN" && "Token de acesso do Business Manager"}
                    {k === "FB_TEST_EVENT_CODE" && "Opcional: código de teste pra validar no Events Manager"}
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://supabase.com/dashboard/project/hsiwtgzixratjuigjxyj/functions/secrets"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              Abrir secrets no Supabase
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Eventos que disparam CAPI automaticamente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CAPI_EVENTOS_DISPONIVEIS.map((e) => {
                const active = config?.capi_eventos?.includes(e.value);
                return (
                  <button
                    key={e.value}
                    onClick={() => toggleEvento(e.value)}
                    disabled={!config?.capi_ativo}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all",
                      active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted",
                      !config?.capi_ativo && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center",
                      active ? "border-primary bg-primary" : "border-muted-foreground/30",
                    )}>
                      {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs">{e.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>
                <strong>Purchase</strong> usa o <code className="bg-muted px-1 rounded">valor_fechamento</code> do lead + <code className="bg-muted px-1 rounded">data_fechamento</code> como event_time.
              </span>
            </p>
          </div>
        </div>
      </motion.section>

      {/* Google Sheets sync */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border rounded-xl shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold">Sincronização Google Sheets</h3>
              <p className="text-xs text-muted-foreground">
                {lastSync ? `Último sync: ${formatDateTime(lastSync.executado_em)}` : "Sem sync registrado"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncNow.isPending} className="gap-2">
            <RefreshCw className={cn("w-3.5 h-3.5", syncNow.isPending && "animate-spin")} />
            Sincronizar agora
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              Abas bloqueadas (ignoradas no sync)
            </label>
            <div className="flex gap-2">
              <Input
                value={blockedInput}
                onChange={(e) => setBlockedInput(e.target.value)}
                placeholder="MARIA, EVELIN, TESTE"
                className="flex-1"
              />
              <Button onClick={saveBlockedTabs} variant="outline">Salvar</Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Separe os nomes das abas por vírgula. Essas abas NÃO entrarão no Board.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Planilha:</span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${config?.google_sheet_id ?? "1rR3k_gq9r_Lq0BR55A0QTYIDQDUlCnrkbITLOe8XeJQ"}/edit`}
                target="_blank"
                rel="noopener"
                className="text-primary hover:underline font-mono text-[10px] flex items-center gap-1"
              >
                Abrir no Sheets
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cron sheets→DB:</span>
              <code className="bg-background px-1.5 py-0.5 rounded">*/5 * * * *</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cron DB→sheets:</span>
              <code className="bg-background px-1.5 py-0.5 rounded">*/2 * * * *</code>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Logs */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border rounded-xl shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Logs de integração
          </h3>
          <p className="text-xs text-muted-foreground">Últimas execuções (atualiza a cada 15s)</p>
        </div>
        <div className="divide-y max-h-[400px] overflow-y-auto scrollbar-thin">
          {(logs ?? []).length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">Sem logs ainda.</div>
          )}
          {(logs ?? []).map((log: any) => (
            <div key={log.id} className="px-5 py-2.5 flex items-center gap-3 text-sm hover:bg-muted/30">
              {log.status === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : log.status === "partial" ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded uppercase">{log.tipo}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(log.executado_em)}</span>
                </div>
                <div className="text-xs mt-0.5 truncate">
                  {log.rows_affected > 0 && <span className="font-medium">{log.rows_affected} registros · </span>}
                  <span className="text-muted-foreground">{log.mensagem}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-muted/30 border rounded-xl p-4 flex items-center gap-3 text-sm"
      >
        <Info className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <div className="font-medium">Documentação do projeto</div>
          <div className="text-xs text-muted-foreground">
            Regras de negócio, arquitetura e gotchas em{" "}
            <Link
              href="https://github.com/dosedegrowth-design/comercialhlmodels/blob/main/REGRAS_E_LOGICA.md"
              target="_blank"
              className="text-primary hover:underline"
            >
              REGRAS_E_LOGICA.md
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
