import { KanbanSquare } from "lucide-react";

export default function BoardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Board Comercial</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de leads em Kanban e lista
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <KanbanSquare className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="font-semibold mb-1">Board Comercial</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Aqui virá o Kanban com drag & drop, filtros de data/campanha/responsável, busca por
          nome/telefone/email, drawer de detalhes e export CSV/Excel.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Implementação — <strong>Fase 3</strong>
        </p>
      </div>
    </div>
  );
}
