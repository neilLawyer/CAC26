// Display-density preference ("comfortable" | "compact"), stored the same way
// as the theme: a data attribute on <html> that CSS reads, mirrored to
// localStorage, applied by a blocking script in layout.tsx so there's no
// flash. Components subscribe via useSyncExternalStore (see useDensity in
// components/results/ResultsControls.tsx).

const STORAGE_KEY = "opendoor-density";

export type Density = "comfortable" | "compact";

const listeners = new Set<() => void>();

function currentDensity(): Density {
  return document.documentElement.getAttribute("data-density") === "compact"
    ? "compact"
    : "comfortable";
}

export function subscribeDensity(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getDensitySnapshot(): Density {
  return currentDensity();
}

export function getDensityServerSnapshot(): Density {
  return "comfortable"; // matches the no-attribute default in CSS
}

export function setDensity(density: Density) {
  if (density === "compact") {
    document.documentElement.setAttribute("data-density", "compact");
  } else {
    document.documentElement.removeAttribute("data-density");
  }
  window.localStorage.setItem(STORAGE_KEY, density);
  listeners.forEach((l) => l());
}
