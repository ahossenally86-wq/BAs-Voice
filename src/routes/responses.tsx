import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Sparkles, Edit3, Save, X } from "lucide-react";
import { useLocalStorage } from "../hooks/use-local-storage";
import { PageHeader } from "../components/page-header";
import { cn } from "../lib/utils";

type Shortcut = { id: string; trigger: string; expansion: string };

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: "s1", trigger: "dc", expansion: "Can we double click on that?" },
  { id: "s2", trigger: "pa", expansion: "Can you clarify the pain point?" },
  { id: "s3", trigger: "own", expansion: "Who owns this action?" },
  { id: "s4", trigger: "su", expansion: "What would success look like?" },
  { id: "s5", trigger: "as", expansion: "What assumptions are we making?" },
  { id: "s6", trigger: "th", expansion: "Thank you, that's helpful." },
];

export const Route = createFileRoute("/responses")({
  component: ResponseBuilder,
});

function ResponseBuilder() {
  const [shortcuts, setShortcuts] = useLocalStorage<Shortcut[]>("va-shortcuts", DEFAULT_SHORTCUTS);
  const [recent, setRecent] = useLocalStorage<string[]>("va-resp-recent", []);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Shortcut | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTrigger, setNewTrigger] = useState("");
  const [newExpansion, setNewExpansion] = useState("");

  const suggestions = useMemo(() => {
    const last = input.split(/\s+/).pop() ?? "";
    if (!last) return [];
    return shortcuts.filter((s) => s.trigger.startsWith(last.toLowerCase())).slice(0, 5);
  }, [input, shortcuts]);

  function applySuggestion(s: Shortcut) {
    const parts = input.split(/\s+/);
    parts[parts.length - 1] = s.expansion;
    const next = parts.join(" ");
    setInput(next + " ");
    setRecent((arr) => [s.expansion, ...arr.filter((x) => x !== s.expansion)].slice(0, 8));
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab" && suggestions.length > 0) {
      e.preventDefault();
      applySuggestion(suggestions[0]!);
    }
  }

  function addShortcut() {
    if (!newTrigger.trim() || !newExpansion.trim()) return;
    setShortcuts((arr) => [
      ...arr,
      {
        id: `s${Date.now()}`,
        trigger: newTrigger.trim().toLowerCase(),
        expansion: newExpansion.trim(),
      },
    ]);
    setNewTrigger("");
    setNewExpansion("");
    setAdding(false);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Quick responses"
        title="Type fast, speak faster"
        description="Text expansion shortcuts for live facilitation. Type a trigger and press Tab to expand."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <label htmlFor="composer" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Composer
          </label>
          <div className="relative mt-2">
            <textarea
              id="composer"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Start typing… try 'dc' then press Tab."
              className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm shadow-sm"
            />
            {suggestions.length > 0 && (
              <div
                role="listbox"
                aria-label="Shortcut suggestions"
                className="mt-2 overflow-hidden rounded-lg border border-border bg-card shadow-md"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    role="option"
                    aria-selected={i === 0}
                    onClick={() => applySuggestion(s)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent",
                      i === 0 && "bg-accent/60",
                    )}
                  >
                    <span className="truncate">{s.expansion}</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">{s.trigger}</kbd>
                      {i === 0 && (
                        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Tab</kbd>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {recent.length > 0 && (
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recently used
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => setInput((v) => (v ? v + " " : "") + r + " ")}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-primary/40"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              Shortcuts
            </h2>
            <button
              onClick={() => setAdding((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              New
            </button>
          </div>

          {adding && (
            <div className="mb-3 space-y-2 rounded-lg border border-border bg-background p-3">
              <input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Trigger (e.g. 'dc')"
                aria-label="New trigger"
                className="w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm"
              />
              <textarea
                value={newExpansion}
                onChange={(e) => setNewExpansion(e.target.value)}
                placeholder="Expansion text"
                aria-label="New expansion"
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-card px-2 py-1.5 text-sm"
              />
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => setAdding(false)}
                  className="rounded-md px-2 py-1 text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={addShortcut}
                  className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <ul className="space-y-1.5">
            {shortcuts.map((s) => (
              <li
                key={s.id}
                className="group flex items-start gap-2 rounded-md border border-border bg-background p-2.5"
              >
                {editing === s.id && draft ? (
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={draft.trigger}
                      onChange={(e) => setDraft({ ...draft, trigger: e.target.value })}
                      className="w-full rounded-md border border-input bg-card px-2 py-1 text-xs"
                    />
                    <textarea
                      value={draft.expansion}
                      onChange={(e) => setDraft({ ...draft, expansion: e.target.value })}
                      rows={2}
                      className="w-full resize-none rounded-md border border-input bg-card px-2 py-1 text-xs"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(null)}
                        aria-label="Cancel edit"
                        className="rounded p-1 hover:bg-accent"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => {
                          setShortcuts((arr) =>
                            arr.map((x) => (x.id === s.id ? draft : x)),
                          );
                          setEditing(null);
                        }}
                        aria-label="Save"
                        className="rounded p-1 text-primary hover:bg-accent"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <kbd className="mt-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                      {s.trigger}
                    </kbd>
                    <span className="flex-1 text-sm">{s.expansion}</span>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditing(s.id);
                          setDraft(s);
                        }}
                        aria-label="Edit shortcut"
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() =>
                          setShortcuts((arr) => arr.filter((x) => x.id !== s.id))
                        }
                        aria-label="Delete shortcut"
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-md border border-dashed border-border bg-background/50 p-3 text-xs text-muted-foreground">
            Want a faster workflow? Pin your most-used prompts in{" "}
            <Link to="/library" className="font-medium text-primary hover:underline">
              the library
            </Link>{" "}
            and they'll appear in Meeting Mode.
          </div>
        </section>
      </div>
    </div>
  );
}
