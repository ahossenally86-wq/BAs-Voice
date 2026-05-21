import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Radio,
  FileText,
  Settings,
  Moon,
  Sun,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { cn } from "../lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/meeting", label: "Meeting", icon: Radio },
  { to: "/responses", label: "Responses", icon: Zap },
  { to: "/summary", label: "Summary", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Skip link for screen readers / keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <aside
        className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
        aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Voice Assist</div>
            <div className="text-xs text-muted-foreground">BSA copilot</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-3" aria-label="Main">
          {NAV.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent/60"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <span className="flex items-center gap-2">
              {theme === "light" ? (
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4" aria-hidden="true" />
              )}
              {theme === "light" ? "Dark" : "Light"} mode
            </span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ⌘D
            </kbd>
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="flex w-full flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Voice Assist</span>
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-border p-2"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </header>

        <main id="main-content" className="min-w-0 flex-1">
          {children}
        </main>

        <nav
          className="sticky bottom-0 z-10 grid grid-cols-6 border-t border-border bg-card md:hidden"
          aria-label="Bottom navigation"
        >
          {NAV.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
