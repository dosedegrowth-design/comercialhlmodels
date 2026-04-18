import { Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Administração</h1>
        <p className="text-sm text-muted-foreground">Usuários, integrações e configurações</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Usuários", desc: "Gerenciar equipe e permissões" },
          { title: "Google Sheets", desc: "Service account + mapeamento de colunas" },
          { title: "Facebook Pixel / CAPI", desc: "Pixel ID e Access Token" },
          { title: "Logs de Sincronização", desc: "Histórico de sync Sheets ↔ DB" },
        ].map((s) => (
          <div key={s.title} className="bg-card border rounded-lg p-6">
            <Settings className="w-5 h-5 text-muted-foreground mb-2" />
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            <p className="text-xs text-muted-foreground mt-4">Fase 5</p>
          </div>
        ))}
      </div>
    </div>
  );
}
