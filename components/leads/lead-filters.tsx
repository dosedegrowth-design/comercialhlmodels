"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampanhas, useAbas, type LeadsFilter } from "@/lib/hooks/use-leads";

interface Props {
  filters: LeadsFilter;
  onChange: (f: LeadsFilter) => void;
}

export function LeadFilters({ filters, onChange }: Props) {
  const { data: campanhas } = useCampanhas();
  const { data: abas } = useAbas();

  const hasFilters = !!(filters.search || filters.campanha_id || filters.origem_sheet_tab || filters.from || filters.to);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          className="pl-8"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 0 })}
        />
      </div>

      <Select
        value={filters.origem_sheet_tab ?? "all"}
        onValueChange={(v) => onChange({ ...filters, origem_sheet_tab: v === "all" ? undefined : v, page: 0 })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Formulário" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os formulários</SelectItem>
          {(abas ?? []).map((a) => (
            <SelectItem key={a} value={a}>
              {a.trim()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.campanha_id ?? "all"}
        onValueChange={(v) => onChange({ ...filters, campanha_id: v === "all" ? undefined : v, page: 0 })}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Campanha" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as campanhas</SelectItem>
          {(campanhas ?? []).map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="truncate max-w-[200px] inline-block">{c.nome}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-[150px]"
        value={filters.from?.slice(0, 10) ?? ""}
        onChange={(e) => onChange({ ...filters, from: e.target.value ? `${e.target.value}T00:00:00Z` : undefined, page: 0 })}
      />
      <Input
        type="date"
        className="w-[150px]"
        value={filters.to?.slice(0, 10) ?? ""}
        onChange={(e) => onChange({ ...filters, to: e.target.value ? `${e.target.value}T23:59:59Z` : undefined, page: 0 })}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          <X className="w-4 h-4 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
}
