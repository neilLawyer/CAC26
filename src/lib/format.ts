// Money/number formatting, defined once so every screen renders values the same way.

/** "$1,234" — rounds to whole dollars (matches how the app has always shown money). */
export function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/** "$1,200 – $3,600" */
export function moneyRange(min: number, max: number): string {
  return `${money(min)} – ${money(max)}`;
}
