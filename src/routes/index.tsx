import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Zap,
  Mic,
  Brain,
  Video,
  Lock,
} from "lucide-react";
import { PageHeader } from "../components/page-header";
import { PROMPTS, RECENT_PROMPT_IDS, UPCOMING_MEETINGS, CATEGORIES } from "../lib/mock-data";
import { formatRelativeTime } from "../lib/utils";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const favorites = PROMPTS.filter((p) => p.favorite);
  const recent = RECENT_PROMPT_IDS.map((id) => PROMPTS.find((p) => p.id === id)!).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Good day"
        title="Ready to facilitate."
        description="Your meeting copilot is standing by. Launch Meeting Mode for distraction-free facilitation, or browse your prompt library."
        actions={
          <Link
            to="/meeting"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Start meeting mode
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Upcoming meetings */}
        <section
          aria-labelledby="upcoming-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="upcoming-heading" className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
              Upcoming meetings
            </h2>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <ul className="space-y-2">
            {UPCOMING_MEETINGS.map((m) => (
              <li key={m.id}>
                <Link
                  to="/meeting"
                  className="group flex items-center justify-between rounded-xl border border-transparent bg-secondary/50 p-4 transition-all hover:border-primary/30 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatRelativeTime(m.time)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        {m.attendees}
                      </span>
                      <span className="rounded-full bg-background px-2 py-0.5 font-medium">
                        {m.type}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Favorite prompts */}
        <section
          aria-labelledby="favs-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="favs-heading" className="flex items-center gap-2 text-sm font-semibold">
              <Star className="h-4 w-4 text-warning" aria-hidden="true" />
              Favourite prompts
            </h2>
            <Link to="/library" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {favorites.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-border/60 bg-background p-3 text-sm leading-snug"
              >
                <span className="block">{p.text}</span>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{p.category}</span>
                  {p.shortcut && (
                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">{p.shortcut}</kbd>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Quick-launch categories */}
      <section aria-labelledby="quick-heading" className="mt-8">
        <h2 id="quick-heading" className="mb-3 text-sm font-semibold">
          Quick-launch categories
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, idx) => {
            const count = PROMPTS.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                to="/library"
                search={{ category: cat }}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.6 0.18 ${220 + idx * 18}), oklch(0.55 0.2 ${260 + idx * 18}))`,
                  }}
                  aria-hidden="true"
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold">{cat}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{count} prompts</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent */}
      <section aria-labelledby="recent-heading" className="mt-8">
        <h2 id="recent-heading" className="mb-3 text-sm font-semibold">
          Recently used
        </h2>
        <div className="flex flex-wrap gap-2">
          {recent.map((p) => (
            <span
              key={p.id}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs"
            >
              {p.text}
            </span>
          ))}
        </div>
      </section>

      {/* Future capabilities */}
      <section aria-labelledby="coming-heading" className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="coming-heading" className="text-sm font-semibold">
            Coming soon
          </h2>
          <span className="text-xs text-muted-foreground">Future copilot features</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Mic, label: "Live transcription", desc: "Real-time speech-to-text in meetings." },
            { icon: Brain, label: "AI facilitation hints", desc: "Suggested next questions in context." },
            { icon: Video, label: "Teams & Zoom", desc: "One-click join with copilot panel." },
            { icon: Sparkles, label: "Voice synthesis", desc: "Speak responses in your own voice." },
          ].map(({ icon: Icon, label, desc }) => (
            <article
              key={label}
              className="relative rounded-2xl border border-dashed border-border bg-card/40 p-4"
            >
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                Soon
              </div>
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="mt-2 text-sm font-semibold">{label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
