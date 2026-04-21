"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SyncResult {
  ok: boolean;
  total_linhas: number;
  skipped: number;
  total_abas: number;
  abas: Array<{
    aba: string;
    status: string;
    linhas?: number;
    motivo?: string;
  }>;
  duracao_ms: number;
}

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    if (loading) return;
    setLoading(true);

    const toastId = toast.loading("Atualizando leads da planilha...");

    try {
      const res = await fetch("/api/sync/sheets-to-db", { method: "POST" });
      const data: SyncResult | { error: string } = await res.json();

      if (!res.ok || !("ok" in data)) {
        const msg = "error" in data ? data.error : "Falha desconhecida";
        toast.error(`Erro ao atualizar: ${msg}`, { id: toastId });
        return;
      }

      const importadas = data.abas.filter((a) => a.status === "importada").length;
      const bloqueadas = data.abas.filter((a) => a.status === "bloqueada").length;
      const vazias = data.abas.filter((a) => a.status === "vazia").length;

      toast.success(
        `${data.total_linhas} leads processados em ${data.total_abas} abas`,
        {
          id: toastId,
          description: `${importadas} importadas, ${bloqueadas} bloqueadas, ${vazias} vazias (${(
            data.duracao_ms / 1000
          ).toFixed(1)}s)`,
          duration: 6000,
        }
      );

      // Refresh da rota atual pra puxar os dados novos
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro de rede";
      toast.error(`Erro: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Atualizar agora (forçar sync com Sheets)"
      title="Atualizar agora (lê a planilha e importa leads novos)"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
    </button>
  );
}
