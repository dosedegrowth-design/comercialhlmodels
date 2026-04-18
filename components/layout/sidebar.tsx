"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  KanbanSquare,
  BarChart3,
  Download,
  Settings,
  Users,
  Sparkles,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAbas } from "@/lib/hooks/use-leads";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const MAIN_NAV = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/board", label: "Board Comercial", icon: KanbanSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendedores", label: "Vendedores", icon: Users },
] as const;

const FOOTER_NAV = [
  { href: "/export", label: "Exportar", icon: Download },
  { href: "/admin", label: "Configurações", icon: Settings },
] as const;

const ABA_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-pink-500",
  "bg-amber-500", "bg-emerald-500", "bg-cyan-500",
  "bg-rose-500", "bg-indigo-500",
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: abas } = useAbas();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? "");
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const currentTab = searchParams.get("aba");

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card">
      <div className="h-16 flex items-center px-5 border-b">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-card"
          >
            HL
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />
          </motion.div>
          <div>
            <h1 className="text-sm font-bold leading-tight">HL Models</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Painel Comercial</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* MENU */}
        <div className="px-3 py-3">
          <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Menu
          </div>
          <nav className="space-y-0.5">
            {MAIN_NAV.map((item, idx) => {
              const active =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* FORMULÁRIOS */}
        {abas && abas.length > 0 && (
          <div className="px-3 py-2">
            <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Formulários
            </div>
            <nav className="space-y-0.5">
              {abas.map((aba, idx) => {
                const isActive = pathname === "/board" && currentTab === aba;
                return (
                  <Link
                    key={aba}
                    href={`/board?aba=${encodeURIComponent(aba)}`}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", ABA_COLORS[idx % ABA_COLORS.length])} />
                    <span className="truncate text-xs">{aba.trim()}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* GERAL */}
        <div className="px-3 py-3">
          <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Geral
          </div>
          <nav className="space-y-0.5">
            {FOOTER_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white shrink-0">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{userEmail || "—"}</div>
            <div className="text-[10px] text-muted-foreground">DDG · v0.3.0</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
