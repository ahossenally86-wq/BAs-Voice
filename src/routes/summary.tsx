import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, ListChecks, Lightbulb, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/page-header";
import { useLocalStorage } from "../hooks/use-local-storage";

type Note = { id: string; text: string; ts: number };
type Action = { id: string; text: string; owner: string; done: boolean };
type Decision = { id: string; text: string; ts: number };

export const Route = createFileRoute("/summary")({
  component: Summary,
});

function Summary() {
  const [title] = useLocalStorage<string>("va-meeting-title", "Untitled meeting");
  const [notes] = useLocalStorage<Note[]>("va-notes", []);
  const [actions] = useLocalStorage<Action[]>("va-actions", []);
  const [decisions] = useLocalStorage<Decision[]>("va-decisions", []);

  const total = notes.length + actions.length + decisions.length;

  function exportSummary() {
    const lines: string[] = [];
    lines.push(`# ${title}`);
    lines.push(`Generated ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("## Decisions");
    decisions.length === 0 ? lines.push("_None_") : decisions.forEach((d) => lines.push(`- ${d.text}`));
    lines.push("");
    lines.push("## Action items");
    actions.length === 0
      ? lines.push("_None_")
      : actions.forEach((a) => lines.push(`- [${a.done ? "x" : " "}] ${a.text} — _${a.owner}_`));
    lines.push("");
    lines.push("## Notes");
    notes.length === 0 ? lines.push("_None_") : notes.forEach((n) => lines.push(`- ${n.text}`));

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Meeting summary"
        title={title || "Untitled meeting"}
        description={`Captured from your most recent Meeting Mode session. ${total} item${total === 1 ? "" : "s"} total.`}
        actions={
          <div className="flex gap-2">
            <Link
              to="/meeting"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              Back to meeting
            </Link>
            <button
              onClick={exportSummary}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export
            </button>
          </div>
        }
      />

      {total === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold">No captures yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a meeting to capture notes, decisions and action items.
          </p>
          <Link
            to="/meeting"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Open Meeting Mode
          </Link>
        </div>
      )}

      {total > 0 && (
        <div className="mt-8 space-y-6">
          <Section title="Decisions" icon={Lightbulb} count={decisions.length} accent="warning">
            {decisions.length === 0 ? (
              <Empty>No decisions recorded.</Empty>
            ) : (
              <ul className="space-y-2">
                {decisions.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border-l-2 border-warning bg-card p-3 text-sm shadow-sm"
                  >
                    {d.text}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Action items" icon={ListChecks} count={actions.length} accent="success">
            {actions.length === 0 ? (
              <Empty>No actions captured.</Empty>
            ) : (
              <ul className="space-y-2">
                {actions.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm shadow-sm"
                  >
                    <span
                      className={
                        a.done
                          ? "mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-success"
                          : "mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40"
                      }
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <div className={a.done ? "text-muted-foreground line-through" : ""}>
                        {a.text}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">Owner: {a.owner}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Notes" icon={ScrollText} count={notes.length} accent="primary">
            {notes.length === 0 ? (
              <Empty>No notes yet.</Empty>
            ) : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-border bg-card p-3 text-sm shadow-sm"
                  >
                    {n.text}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  count: number;
  icon: typeof FileText;
  accent: "warning" | "success" | "primary";
  children: React.ReactNode;
}) {
  const color =
    accent === "warning" ? "text-warning" : accent === "success" ? "text-success" : "text-primary";
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
        {title}
        <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
      {children}
    </div>
  );
}
