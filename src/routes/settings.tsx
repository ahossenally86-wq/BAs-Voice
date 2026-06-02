import { createFileRoute, Link } from "@tanstack/react-router";
import { Moon, Sun, Contrast, MousePointerClick, Keyboard, ShieldCheck, Volume2, Play } from "lucide-react";
import { PageHeader } from "../components/page-header";
import { useA11ySettings, useTheme } from "../hooks/use-theme";
import { useSpeech, useSpeechSettings } from "../hooks/use-speech";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const { theme, setTheme } = useTheme();
  const { highContrast, setHighContrast, reduceMotion, setReduceMotion } = useA11ySettings();
  const { settings: speech, setSettings: setSpeech } = useSpeechSettings();
  const { speak, voices, supported: speechSupported } = useSpeech();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Settings"
        title="Accessibility & appearance"
        description="Voice Assist is designed accessibility-first. Tune the experience to how you work best."
      />

      <div className="mt-8 space-y-6">
        <Card title="Theme" icon={theme === "dark" ? Moon : Sun}>
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2 sm:max-w-xs">
            <ThemeOption
              label="Light"
              icon={Sun}
              active={theme === "light"}
              onClick={() => setTheme("light")}
            />
            <ThemeOption
              label="Dark"
              icon={Moon}
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            />
          </div>
        </Card>

        <Card title="High contrast" icon={Contrast}>
          <Toggle
            label="Boost contrast for borders and text"
            checked={highContrast}
            onChange={setHighContrast}
          />
        </Card>

        <Card title="Reduced motion" icon={MousePointerClick}>
          <Toggle
            label="Minimize animations and transitions"
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
        </Card>

        <Card title="Voice (text-to-speech)" icon={Volume2}>
          {!speechSupported ? (
            <p className="text-sm text-muted-foreground">
              Your browser does not support speech synthesis.
            </p>
          ) : (
            <div className="space-y-4">
              <Toggle
                label="Speak prompts aloud in Meeting Mode"
                checked={speech.enabled}
                onChange={(v) => setSpeech({ ...speech, enabled: v })}
              />
              <div className="space-y-1.5">
                <label htmlFor="voice-select" className="text-xs font-medium">
                  Voice
                </label>
                <select
                  id="voice-select"
                  value={speech.voiceURI ?? ""}
                  onChange={(e) =>
                    setSpeech({ ...speech, voiceURI: e.target.value || null })
                  }
                  className="w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm shadow-sm"
                >
                  <option value="">System default</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} — {v.lang}
                    </option>
                  ))}
                </select>
              </div>
              <Slider
                label="Speed"
                value={speech.rate}
                min={0.5}
                max={1.6}
                step={0.05}
                onChange={(v) => setSpeech({ ...speech, rate: v })}
                format={(v) => `${v.toFixed(2)}×`}
              />
              <Slider
                label="Pitch"
                value={speech.pitch}
                min={0.5}
                max={1.6}
                step={0.05}
                onChange={(v) => setSpeech({ ...speech, pitch: v })}
                format={(v) => v.toFixed(2)}
              />
              <button
                type="button"
                onClick={() =>
                  speak(
                    "This is how Voice Assist will sound in your meetings.",
                    { force: true },
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-primary/40"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                Preview voice
              </button>
            </div>
          )}
        </Card>

        <Card title="Keyboard shortcuts" icon={Keyboard}>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <Shortcut keys={["Tab"]} desc="Expand quick response" />
            <Shortcut keys={["⌘", "Enter"]} desc="Add note/action/decision" />
            <Shortcut keys={["⌘", "K"]} desc="Open command palette (soon)" />
            <Shortcut keys={["Esc"]} desc="Dismiss popovers" />
          </dl>
        </Card>

        <Card title="Privacy" icon={ShieldCheck}>
          <p className="text-sm text-muted-foreground">
            All data in this MVP lives locally in your browser. No backend, no tracking. Future
            integrations with meeting platforms will be opt-in per meeting.
          </p>
        </Card>

        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-sm text-muted-foreground">
          Need to test the experience?{" "}
          <Link to="/meeting" className="font-medium text-primary hover:underline">
            Open Meeting Mode
          </Link>{" "}
          and try navigating with only your keyboard.
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Moon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function ThemeOption({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Sun;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-accent text-accent-foreground"
          : "border-border bg-background hover:border-primary/40",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-card shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}

function Shortcut({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
      <span className="text-muted-foreground">{desc}</span>
      <span className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd key={k} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
            {k}
          </kbd>
        ))}
      </span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="font-mono text-muted-foreground">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        aria-label={label}
      />
    </div>
  );
}
