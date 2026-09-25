"use client";

import { useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/ui/icons";
import { THEME_KEY as KEY } from "@/lib/theme-script";

type Theme = "light" | "dark" | "system";
const EVENT = "atlas:theme";
const ORDER: Theme[] = ["system", "light", "dark"];
const LABELS: Record<Theme, string> = { system: "Sistema", light: "Claro", dark: "Oscuro" };

function readTheme(): Theme {
  try {
    const t = window.localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = theme;
}

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readTheme() === "system") apply("system");
    callback();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // ignore
  }
  apply(theme);
  window.dispatchEvent(new Event(EVENT));
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);
  return { theme, setTheme };
}

/** Compact cycling button for the navbar. */
export function ThemeToggle() {
  const { theme } = useTheme();
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : MonitorIcon;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-fg"
      aria-label={`Tema: ${LABELS[theme]}. Cambiar a ${LABELS[next]}`}
      title={`Tema: ${LABELS[theme]}`}
    >
      <Icon size={17} />
    </button>
  );
}

/** Explicit three-way segmented control (footer / mobile menu). */
export function ThemeSegmented() {
  const { theme } = useTheme();
  const options: { value: Theme; icon: typeof SunIcon }[] = [
    { value: "light", icon: SunIcon },
    { value: "dark", icon: MoonIcon },
    { value: "system", icon: MonitorIcon },
  ];
  return (
    <div role="radiogroup" aria-label="Tema de color" className="inline-flex rounded-lg border border-border p-0.5">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] transition-colors ${
            theme === value ? "bg-subtle text-fg" : "text-muted hover:text-fg"
          }`}
        >
          <Icon size={14} />
          {LABELS[value]}
        </button>
      ))}
    </div>
  );
}
