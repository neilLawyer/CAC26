// Accessibility preferences: text size, high contrast, dyslexia-friendly font,
// and an explicit reduce-motion override (on top of the OS-level
// prefers-reduced-motion query the rest of the app already honors). Same
// pattern as theme/density/locale: data attributes on <html>, mirrored to
// localStorage as one JSON blob, applied pre-paint by the blocking script in
// layout.tsx so there's no flash, read by CSS everywhere (see globals.css).

const STORAGE_KEY = "opendoor-a11y";

export type TextSize = "md" | "lg" | "xl";

export interface A11yPrefs {
  textSize: TextSize;
  highContrast: boolean;
  dyslexiaFont: boolean;
  reduceMotion: boolean;
}

const DEFAULT_PREFS: A11yPrefs = {
  textSize: "md",
  highContrast: false,
  dyslexiaFont: false,
  reduceMotion: false,
};

const listeners = new Set<() => void>();

// useSyncExternalStore requires getSnapshot to return a referentially stable
// value when nothing changed (else it re-renders forever) — cache the last
// object and only build a new one when a DOM attribute actually differs.
let cached: A11yPrefs = DEFAULT_PREFS;

function currentPrefs(): A11yPrefs {
  const root = document.documentElement;
  const size = root.getAttribute("data-text-size");
  const next: A11yPrefs = {
    textSize: size === "lg" || size === "xl" ? size : "md",
    highContrast: root.getAttribute("data-contrast") === "high",
    dyslexiaFont: root.getAttribute("data-font") === "dyslexia",
    reduceMotion: root.getAttribute("data-motion") === "reduce",
  };
  if (
    next.textSize !== cached.textSize ||
    next.highContrast !== cached.highContrast ||
    next.dyslexiaFont !== cached.dyslexiaFont ||
    next.reduceMotion !== cached.reduceMotion
  ) {
    cached = next;
  }
  return cached;
}

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPrefs()));
  listeners.forEach((l) => l());
}

export function subscribeA11y(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getA11ySnapshot(): A11yPrefs {
  return currentPrefs();
}

export function getA11yServerSnapshot(): A11yPrefs {
  return DEFAULT_PREFS;
}

export function setTextSize(textSize: TextSize) {
  const root = document.documentElement;
  if (textSize === "md") root.removeAttribute("data-text-size");
  else root.setAttribute("data-text-size", textSize);
  persist();
}

export function setHighContrast(on: boolean) {
  const root = document.documentElement;
  if (on) root.setAttribute("data-contrast", "high");
  else root.removeAttribute("data-contrast");
  persist();
}

export function setDyslexiaFont(on: boolean) {
  const root = document.documentElement;
  if (on) root.setAttribute("data-font", "dyslexia");
  else root.removeAttribute("data-font");
  persist();
}

export function setReduceMotion(on: boolean) {
  const root = document.documentElement;
  if (on) root.setAttribute("data-motion", "reduce");
  else root.removeAttribute("data-motion");
  persist();
}

export function resetA11yPrefs() {
  setTextSize("md");
  setHighContrast(false);
  setDyslexiaFont(false);
  setReduceMotion(false);
}
