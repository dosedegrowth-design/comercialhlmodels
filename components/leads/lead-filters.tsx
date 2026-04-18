"use client";

import { Search, X, Filter, Calendar, Tag, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampanhas, useAbas, type LeadsFilter } from "@/lib/hooks/use-leads";
import { cn, STATUS_LABELS } from "@/lib/utils";
import type { LeadStatus } from "@/types/database";
import { useState } from "react";

interface Props {
  filters: LeadsFilter;
  onChange: (f: LeadsFilter) => void;
}

const QUICK_DATES = [
  { label: "Hoje", days: 1 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
] as const;

const STATUS_CHIPS: { id: LeadStatus; dot: string }[] = [
  { id: "novo", dot: "bg-blue-500" },
  { id: "contato_feito", dot: "bg-amber-500" },
  { id: "qualificado", dot: "bg-purple-500" },
  { id: "agendado", dot: "bg-cyan-500" },
  { id: "fechado", dot: "bg-emerald-500" },
  { id: "perdido", dot: "bg-red-500" },
];

export function LeadFilters({ filters, onChange }: Props) {
  const { data: campanhas } = useCampanhas();
  const { data: abas } = useAbas();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasFilters = !!(
    filters.search ||
    filters.campanha_id ||
    filters.origem_sheet_tab ||
    filters.from ||
    filters.to ||
    (filters.status && filters.status.length > 0)
  );

  function toggleStatus(s: LeadStatus) {
    const current = filters.status ?? [];
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
    onChange({ ...filters, status: next.length > 0 ? next : undefined, page: 0 });
  }

  function setQuickDate(days: number) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    from.setHours(0, 0, 0, 0);
    onChange({ ...filters, from: from.toISOString(), to: to.toISOString(), page: 0 });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            className="pl-9 h-9"
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 0 })}
          />
        </div>

        <Select
          value={filters.origem_sheet_tab ?? "all"}
          onValueChange={(v) => onChange({ ...filters, origem_sheet_tab: v === "all" ? undefined : v, page: 0 })}
        >
          <SelectTrigger className="w-[180px] h-9">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Formulário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos formulários</SelectItem>
            {(abas ?? []).map((a) => (
              <SelectItem key={a} value={a}>{a.trim()}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.campanha_id ?? "all"}
          onValueChange={(v) => onChange({ ...filters, campanha_id: v === "all" ? undefined : v, page: 0 })}
        >
          <SelectTrigger className="w-[200px] h-9">
            <Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Campanha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas campanhas</SelectItem>
            {(campanhas ?? []).slice(0, 30).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="truncate max-w-[200px] inline-block">{c.nome}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showAdvanced ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-1.5 h-9"
        >
          <Filter className="w-3.5 h-3.5" />
          {showAdvanced ? "Ocultar" : "Mais filtros"}
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ pageSize: filters.pageSize })} className="gap-1 h-9">
            <X className="w-3.5 h-3.5" /> Limpar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
          Status:
        </span>
        {STATUS_CHIPS.map((s) => {
          const active = filters.status?.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleStatus(s.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all",
                active
                  ? "bg-foreground/5 border-foreground/20 font-medium text-foreground"
                  : "border-transparent bg-muted/50 hover:bg-muted text-muted-foreground",
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
              {STATUS_LABELS[s.id]}
            </button>
          );
        })}
      </div>

      {showAdvanced && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-1">Período:</span>
            {QUICK_DATES.map((q) => (
              <Button key={q.label} variant="outline" size="sm" onClick={() => setQuickDate(q.days)} className="h-7 text-xs">
                {q.label}
              </Button>
            ))}
          </div>

          <Input
            type="date"
            className="w-[140px] h-8 text-xs"
            value={filters.from?.slice(0, 10) ?? ""}
            onChange={(e) => onChange({ ...filters, from: e.target.value ? `${e.target.value}T00:00:00Z` : undefined, page: 0 })}
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="date"
            className="w-[140px] h-8 text-xs"
            value={filters.to?.slice(0, 10) ?? ""}
            onChange={(e) => onChange({ ...filters, to: e.target.value ? `${e.target.value}T23:59:59Z` : undefined, page: 0 })}
          />
        </div>
      )}
    </div>
  );
}
