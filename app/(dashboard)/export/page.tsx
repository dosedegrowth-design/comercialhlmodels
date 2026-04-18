import { Download } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Exportar Base</h1>
        <p className="text-sm text-muted-foreground">
          Filtre e baixe os leads em CSV ou Excel
        </p>
      </div>

      <div className="bg-card border rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <Download className="w-10 h-10 text-muted-foreground mb-3" />
        <h2 className="font-semibold">Export Avançado</h2>
        <p className="text-sm text-muted-foreground max-w-md mt-2">
          Filtros por data, status, campanha, responsável. Seleção de colunas. Formato CSV ou XLSX.
        </p>
        <p className="text-xs text-muted-foreground mt-4">Implementação — Fase 3</p>
      </div>
    </div>
  );
}
