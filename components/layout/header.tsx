"use client";

import { Moon, Sun, LogOut, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SyncButton } from "./sync-button";

export function Header({ userEmail, isAdmin }: { userEmail?: string; isAdmin?: boolean }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && <SyncButton />}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className="text-muted-foreground hidden sm:inline">{userEmail ?? "—"}</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
