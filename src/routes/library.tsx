import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Send, Star, Search, ChevronDown, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "../components/page-header";
import { CATEGORIES, PROMPTS, type PromptCategory, type Prompt } from "../lib/mock-data";
import { useLocalStorage } from "../hooks/use-local-storage";
import { cn } from "../lib/utils";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/library")({
  component: Library,
  validateSearch: searchSchema,
});

function Library() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const [query, setQuery] = useState(search.q ?? "");
  const [favs, setFavs] = useLocalStorage<string[]>("va-favs", PROMPTS.filter((p) => p.favorite).map((p) => p.id));
  const [recent, setRecent] = useLocalStorage<string[]>("va-recent", []);
  const [pinned, setPinned] = useLocalStorage<string[]>("va-pinned", []);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPTS.filter((p) => {
      if (search.category && p.category !== search.category) return false;
      if (!q) return true;
      return (
        p.text.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        (p.shortcut ?? "").includes(q)
      );
    });
  }, [query, search.category]);

  const grouped = useMemo(() => {
    const map: Record<string, Prompt[]> = {};
    for (const p of filtered) {
      (map[p.category] ||= []).push(p);
    }
    return map;
  }, [filtered]);

  function toggleFav(id: string) {
    setFavs((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  }
  function track(id: string) {
    setRecent((arr) => [id, ...arr.filter((x) => x !== id)].slice(0, 10));
  }
  async function copyPrompt(p: Prompt) {
    try {
      await navigator.clipboard.writeText(p.text);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId((c) => (c === p.id ? null : c)), 1200);
      track(p.id);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }
  function sendToMeeting(p: Prompt) {
    setPinned((arr) => (arr.includes(p.id) ? arr : [...arr, p.id]));
    track(p.id);
    toast.success("Pinned for Meeting Mode", {
      action: { label: "Open", onClick: () => navigate({ to: "/meeting" }) },
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Library"
        title="Smart question library"
        description="Searchable, keyboard-friendly prompts grouped by facilitation context."
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="prompt-search" className="sr-only">
            Search prompts
          </label>
          <input
            id="prompt-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts, tags, shortcuts…"
            className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm shadow-sm placeholder:text-muted-foreground"
          />
        </div>
        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex flex-wrap gap-1.5"
        >
          <CategoryChip
            label="All"
            active={!search.category}
            onClick={() => navigate({ search: { q: query || undefined } })}
          />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={search.category === c}
              onClick={() => navigate({ search: { category: c, q: query || undefined } })}
            />
          ))}
        </div>
      </div>

      {recent.length > 0 && !query && !search.category && (
        <section aria-labelledby="recent-heading" className="mt-6">
          <h2 id="recent-heading" className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recently used
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent
              .map((id) => PROMPTS.find((p) => p.id === id))
              .filter((p): p is Prompt => Boolean(p))
              .slice(0, 6)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => copyPrompt(p)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:border-primary/40"
                >
                  {p.text}
                </button>
              ))}
          </div>
        </section>
      )}

      <div className="mt-8 space-y-6">
        {Object.keys(grouped).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">No prompts match your search.</p>
          </div>
        )}
        {(Object.keys(grouped) as PromptCategory[]).map((cat) => {
          const isCollapsed = collapsed[cat];
          const items = grouped[cat]!;
          return (
            <section key={cat} aria-labelledby={`cat-${cat}`}>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
                className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left"
                aria-expanded={!isCollapsed}
              >
                <h2 id={`cat-${cat}`} className="flex items-center gap-2 text-sm font-semibold">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  {cat}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </h2>
              </button>
              {!isCollapsed && (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => {
                    const fav = favs.includes(p.id);
                    const copied = copiedId === p.id;
                    return (
                      <li
                        key={p.id}
                        className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <p className="text-sm leading-snug">{p.text}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {p.shortcut && (
                              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
                                {p.shortcut}
                              </kbd>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <IconBtn
                              label={fav ? "Unfavourite" : "Favourite"}
                              onClick={() => toggleFav(p.id)}
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  fav ? "fill-warning text-warning" : "text-muted-foreground",
                                )}
                                aria-hidden="true"
                              />
                            </IconBtn>
                            <IconBtn label="Copy" onClick={() => copyPrompt(p)}>
                              {copied ? (
                                <Check className="h-4 w-4 text-success" aria-hidden="true" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              )}
                            </IconBtn>
                            <button
                              onClick={() => sendToMeeting(p)}
                              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              <Send className="h-3 w-3" aria-hidden="true" />
                              Send
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
    >
      {children}
    </button>
  );
}
