import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  Send,
  Plus,
  Check,
  Trash2,
  ListChecks,
  ScrollText,
  Lightbulb,
  Sparkles,
  Mic,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/page-header";
import { CATEGORIES, PROMPTS, type Prompt, type PromptCategory } from "../lib/mock-data";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useSpeech } from "../hooks/use-speech";
import { cn, formatDuration } from "../lib/utils";

export const Route = createFileRoute("/meeting")({
  component: MeetingMode,
});

type Note = { id: string; text: string; ts: number };
type Action = { id: string; text: string; owner: string; done: boolean };
type Decision = { id: string; text: string; ts: number };

function MeetingMode() {
  const [meetingTitle, setMeetingTitle] = useLocalStorage<string>(
    "va-meeting-title",
    "Payments discovery workshop",
  );
  const [activeCategory, setActiveCategory] = useState<PromptCategory>(CATEGORIES[0]!);
  const [pinned] = useLocalStorage<string[]>("va-pinned", []);
  const [notes, setNotes] = useLocalStorage<Note[]>("va-notes", []);
  const [actions, setActions] = useLocalStorage<Action[]>("va-actions", []);
  const [decisions, setDecisions] = useLocalStorage<Decision[]>("va-decisions", []);
  const [input, setInput] = useState("");
  const [inputKind, setInputKind] = useState<"note" | "action" | "decision">("note");
  const [actionOwner, setActionOwner] = useState("");
  const [responsePanel, setResponsePanel] = useState<string | null>(null);
  const { speak, supported: speechSupported } = useSpeech();

  // Timer
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1000), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const promptsByCat = useMemo(() => {
    const map: Record<string, Prompt[]> = {};
    for (const p of PROMPTS) (map[p.category] ||= []).push(p);
    return map;
  }, []);

  const pinnedPrompts = useMemo(
    () => pinned.map((id) => PROMPTS.find((p) => p.id === id)).filter((p): p is Prompt => Boolean(p)),
    [pinned],
  );

  function sendPrompt(p: Prompt) {
    setResponsePanel(p.text);
    setTimeout(() => setResponsePanel(null), 2400);
    toast.success("Sent to meeting", { duration: 1500 });
  }

  function addItem() {
    const text = input.trim();
    if (!text) return;
    const ts = Date.now();
    const id = `${ts}-${Math.random().toString(36).slice(2, 7)}`;
    if (inputKind === "note") setNotes((n) => [...n, { id, text, ts }]);
    if (inputKind === "decision") setDecisions((d) => [...d, { id, text, ts }]);
    if (inputKind === "action")
      setActions((a) => [...a, { id, text, owner: actionOwner || "Unassigned", done: false }]);
    setInput("");
    setActionOwner("");
  }

  // Cmd+Enter to send
  function onInputKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col md:h-dvh">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Exit
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              running ? "animate-pulse bg-destructive" : "bg-muted-foreground/40",
            )}
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-muted-foreground">
            {running ? "Live" : "Paused"}
          </span>
        </div>
        <label htmlFor="meeting-title" className="sr-only">
          Meeting title
        </label>
        <input
          id="meeting-title"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold hover:border-border focus:border-input"
        />
        <div
          className="rounded-md bg-secondary px-3 py-1.5 font-mono text-sm tabular-nums"
          aria-live="off"
          aria-label="Meeting timer"
        >
          {formatDuration(elapsed)}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            aria-label={running ? "Pause meeting" : "Start meeting"}
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setElapsed(0);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
            aria-label="Reset timer"
          >
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Three-pane workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr_360px]">
        {/* Left: categories */}
        <aside
          className="hidden border-r border-border bg-sidebar/50 p-3 lg:block"
          aria-label="Prompt categories"
        >
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </div>
          <ul className="mt-1 space-y-0.5">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <button
                  onClick={() => setActiveCategory(c)}
                  aria-current={activeCategory === c ? "true" : undefined}
                  className={cn(
                    "w-full rounded-md px-2.5 py-2 text-left text-sm",
                    activeCategory === c
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                  )}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-dashed border-border bg-card/40 p-3 text-xs text-muted-foreground">
            <Sparkles className="mb-1.5 h-4 w-4 text-primary" aria-hidden="true" />
            <p className="font-medium text-foreground">AI suggestions</p>
            <p className="mt-1">Context-aware prompt hints will appear here during live meetings.</p>
          </div>
        </aside>

        {/* Center: large prompt buttons */}
        <section
          aria-label="Quick prompts"
          className="min-h-0 overflow-y-auto bg-background p-4 sm:p-6"
        >
          {/* Mobile category tabs */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                  activeCategory === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {pinnedPrompts.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pinned for this meeting
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {pinnedPrompts.map((p) => (
                  <PromptButton key={p.id} prompt={p} onClick={() => sendPrompt(p)} variant="pinned" />
                ))}
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{activeCategory}</h2>
            <span className="text-xs text-muted-foreground">
              Click to "speak" · Cmd+K for shortcuts
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {promptsByCat[activeCategory]?.map((p) => (
              <PromptButton key={p.id} prompt={p} onClick={() => sendPrompt(p)} />
            ))}
          </div>

          {responsePanel && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card px-5 py-3 shadow-2xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Mic className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Spoken
                  </div>
                  <div className="max-w-md text-sm font-medium">{responsePanel}</div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right: notes/actions/decisions */}
        <aside
          className="flex min-h-0 flex-col border-t border-border bg-sidebar/30 lg:border-l lg:border-t-0"
          aria-label="Meeting capture"
        >
          <div className="border-b border-border p-3">
            <div
              role="tablist"
              aria-label="Capture type"
              className="grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1"
            >
              <CaptureTab active={inputKind === "note"} onClick={() => setInputKind("note")} icon={ScrollText} label="Notes" />
              <CaptureTab active={inputKind === "action"} onClick={() => setInputKind("action")} icon={ListChecks} label="Actions" />
              <CaptureTab active={inputKind === "decision"} onClick={() => setInputKind("decision")} icon={Lightbulb} label="Decisions" />
            </div>

            <div className="mt-3">
              <label htmlFor="capture-input" className="sr-only">
                Add {inputKind}
              </label>
              <textarea
                id="capture-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKey}
                placeholder={
                  inputKind === "note"
                    ? "Capture a quick note…"
                    : inputKind === "action"
                      ? "Describe the action…"
                      : "Record the decision…"
                }
                className="w-full resize-none rounded-md border border-input bg-card p-2 text-sm shadow-sm"
              />
              {inputKind === "action" && (
                <input
                  value={actionOwner}
                  onChange={(e) => setActionOwner(e.target.value)}
                  placeholder="Owner"
                  aria-label="Action owner"
                  className="mt-2 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm shadow-sm"
                />
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  <kbd className="rounded bg-muted px-1 font-mono">⌘</kbd> +{" "}
                  <kbd className="rounded bg-muted px-1 font-mono">Enter</kbd> to add
                </span>
                <button
                  onClick={addItem}
                  disabled={!input.trim()}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-4">
            <CaptureSection title="Notes" count={notes.length} icon={ScrollText}>
              {notes.length === 0 && <EmptyHint>No notes yet.</EmptyHint>}
              <ul className="space-y-1.5">
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="group flex items-start justify-between gap-2 rounded-md border border-border bg-card p-2.5 text-sm"
                  >
                    <span>{n.text}</span>
                    <button
                      onClick={() => setNotes((arr) => arr.filter((x) => x.id !== n.id))}
                      aria-label="Delete note"
                      className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </CaptureSection>

            <CaptureSection title="Action items" count={actions.length} icon={ListChecks}>
              {actions.length === 0 && <EmptyHint>No actions captured.</EmptyHint>}
              <ul className="space-y-1.5">
                {actions.map((a) => (
                  <li
                    key={a.id}
                    className="group flex items-start gap-2 rounded-md border border-border bg-card p-2.5 text-sm"
                  >
                    <button
                      onClick={() =>
                        setActions((arr) =>
                          arr.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)),
                        )
                      }
                      aria-label={a.done ? "Mark incomplete" : "Mark complete"}
                      className={cn(
                        "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        a.done
                          ? "border-success bg-success text-success-foreground"
                          : "border-border",
                      )}
                    >
                      {a.done && <Check className="h-3 w-3" aria-hidden="true" />}
                    </button>
                    <div className="flex-1">
                      <div className={cn(a.done && "text-muted-foreground line-through")}>
                        {a.text}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Owner: {a.owner}
                      </div>
                    </div>
                    <button
                      onClick={() => setActions((arr) => arr.filter((x) => x.id !== a.id))}
                      aria-label="Delete action"
                      className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </CaptureSection>

            <CaptureSection title="Decisions" count={decisions.length} icon={Lightbulb}>
              {decisions.length === 0 && <EmptyHint>No decisions recorded.</EmptyHint>}
              <ul className="space-y-1.5">
                {decisions.map((d) => (
                  <li
                    key={d.id}
                    className="group flex items-start justify-between gap-2 rounded-md border-l-2 border-warning bg-card p-2.5 text-sm"
                  >
                    <span>{d.text}</span>
                    <button
                      onClick={() => setDecisions((arr) => arr.filter((x) => x.id !== d.id))}
                      aria-label="Delete decision"
                      className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </CaptureSection>

            <Link
              to="/summary"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              View full meeting summary
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PromptButton({
  prompt,
  onClick,
  variant,
}: {
  prompt: Prompt;
  onClick: () => void;
  variant?: "pinned";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex min-h-[88px] flex-col justify-between rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-px hover:border-primary/50 hover:shadow-md",
        variant === "pinned" ? "border-primary/40 bg-accent/40" : "border-border",
      )}
    >
      <span className="text-sm font-medium leading-snug">{prompt.text}</span>
      <span className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">{prompt.category}</span>
        <span className="flex items-center gap-1">
          {prompt.shortcut && (
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">{prompt.shortcut}</kbd>
          )}
          <Send className="h-3 w-3 text-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

function CaptureTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ScrollText;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

function CaptureSection({
  title,
  count,
  icon: Icon,
  children,
}: {
  title: string;
  count: number;
  icon: typeof ScrollText;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
        <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium normal-case tracking-normal text-muted-foreground">
          {count}
        </span>
      </h3>
      {children}
    </section>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
      {children}
    </div>
  );
}
