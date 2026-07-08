"use client";

import { useSyncExternalStore } from "react";
import { en, type TranslationKey } from "@/data/i18n/en";
import { es } from "@/data/i18n/es";

// The whole i18n system: a locale store in the theme-store pattern, a useT
// hook over two flat dictionaries, and the header toggle. No library — the
// app needs exactly two locales and ~70 chrome strings. Program records and
// question data stay English this round; the Spanish UI says so honestly
// (see results.esNote). Spanish falls back to English key-by-key, so a
// missing translation is a cosmetic gap, never a crash.

const STORAGE_KEY = "opendoor-locale";

export type Locale = "en" | "es";

const listeners = new Set<() => void>();

function currentLocale(): Locale {
  return document.documentElement.lang === "es" ? "es" : "en";
}

export function subscribeLocale(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getLocaleSnapshot(): Locale {
  return currentLocale();
}

export function getLocaleServerSnapshot(): Locale {
  return "en"; // matches the no-attribute default; the layout script applies "es" pre-paint
}

export function setLocale(locale: Locale) {
  document.documentElement.lang = locale;
  window.localStorage.setItem(STORAGE_KEY, locale);
  listeners.forEach((l) => l());
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getLocaleServerSnapshot);
}

/** t("nav.search") → the active locale's string, falling back to English. */
export function useT(): (key: TranslationKey) => string {
  const locale = useLocale();
  return (key) => (locale === "es" ? (es[key] ?? en[key]) : en[key]);
}

/** "hola {name}" + {name: "ana"} → "hola ana". */
export function formatT(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

/** The EN/ES pill — labeled with the language you'd switch TO. */
export function LanguageToggle() {
  const locale = useLocale();
  const other: Locale = locale === "es" ? "en" : "es";
  return (
    <button
      type="button"
      onClick={() => setLocale(other)}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
      className="press-weight label-mono rounded-full border border-card-border px-2.5 py-1 text-[10px] text-muted hover:text-foreground"
    >
      {other.toUpperCase()}
    </button>
  );
}
