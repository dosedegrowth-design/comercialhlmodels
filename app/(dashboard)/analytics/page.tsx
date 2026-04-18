import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics Marketing</h1>
        <p className="text-sm text-muted-foreground">
          Performance por campanha, grupo de anúncio e criativo
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {["Por Campanha", "Por Grupo de Anúncio", "Por Anúncio"].map((label) => (
          <div key={label} className="bg-card border rounded-lg p-6 min-h-[240px] flex flex-col items-center justify-center text-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground mb-3" />
            <h3 className="font-semibold">{label}</h3>
            <p className="text-xs text-muted-foreground mt-2">Fase 4</p>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-lg p-6 min-h-[300px] flex items-center justify-center text-muted-foreground">
        🌊 Funil de conversão + heatmap horário (Fase 4)
      </div>
    </div>
  );
}
