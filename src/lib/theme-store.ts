const STORAGE_KEY = "opendoor-theme";

const listeners = new Set<() => void>();

function isDarkNow(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getThemeSnapshot(): boolean {
  return isDarkNow();
}

export function getThemeServerSnapshot(): boolean {
  return true; // matches the default in the blocking init script — dark by default
}

export function toggleTheme() {
  const next = !isDarkNow();
  document.documentElement.classList.toggle("dark", next);
  window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  listeners.forEach((l) => l());
}
