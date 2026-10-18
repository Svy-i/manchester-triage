import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, ClipboardPlus, LayoutDashboard, LogOut, Users } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/cadastro", label: "Cadastro", icon: ClipboardPlus },
  { to: "/registros", label: "Registros", icon: Users },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-row items-center gap-1 bg-sidebar p-3 text-sidebar-foreground md:w-60 md:flex-col md:items-stretch md:p-4">
        <div className="mr-4 flex items-center gap-2 px-2 py-2 md:mb-6 md:mr-0">
          <Activity className="h-6 w-6 text-sidebar-primary" />
          <span className="font-semibold tracking-tight">Triagem</span>
        </div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
          className="ml-auto flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent md:ml-0 md:mt-auto"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
