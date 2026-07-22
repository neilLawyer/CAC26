// Themes every Clerk component (SignIn, SignUp, UserButton) to match
// OpenDoor's own design tokens (src/app/globals.css) instead of Clerk's
// default look.
//
// Clerk's `variables` computes hover/shade variants at runtime in JS, so it
// needs literal colors it can parse (hex/rgb) — a `var(--accent)` reference
// resolves only at paint time in the browser and Clerk silently ignores it
// (this is why an earlier version of this file rendered an invisible
// black-on-transparent primary button). These literals are duplicated from
// globals.css's :root / .dark blocks and picked at runtime by theme (see
// ClerkThemeProvider), since there's no live CSS-variable bridge available.
const LIGHT = {
  colorPrimary: "#0d9488",
  colorPrimaryForeground: "#04201c", // matches Button.tsx's text-on-accent color
  colorBackground: "#ffffff",
  colorText: "#0d1226",
  colorTextSecondary: "#575f7d",
  colorInputBackground: "#f5f6fb",
  colorInputText: "#0d1226",
  colorNeutral: "#0d1226",
};

const DARK = {
  colorPrimary: "#2dd4bf",
  colorPrimaryForeground: "#04201c",
  colorBackground: "#151b33",
  colorText: "#e8ecf8",
  colorTextSecondary: "#8e99bd",
  colorInputBackground: "#0c1124",
  colorInputText: "#e8ecf8",
  colorNeutral: "#e8ecf8",
};

// (Clerk's `appearance` prop type isn't part of its public export surface in
// this SDK version, so these are left as plain objects rather than importing
// a type from a private path.)
const SHARED_ELEMENTS = {
  card: "shadow-none",
  footer: "bg-transparent",
  // The "Secured by Clerk / Development mode" badge — not part of this
  // app's own branding. (`!hidden` beats Clerk's own inline display style;
  // plain `hidden` loses that specificity fight.)
  footerItem: "!hidden",
  formButtonPrimary: "press-weight normal-case text-sm font-semibold",
  formFieldInput: "border-card-border",
  socialButtonsBlockButton: "border-card-border",
  dividerLine: "bg-card-border",
  dividerText: "text-muted",
};

export function getClerkAppearance(isDark: boolean) {
  return {
    variables: { ...(isDark ? DARK : LIGHT), borderRadius: "0.75rem" },
    elements: SHARED_ELEMENTS,
  };
}

// Used on the dedicated /sign-in and /sign-up pages, where the app already
// supplies its own bordered card and header/footer copy — strip Clerk's own
// so there's one border/shadow and one "sign in / sign up" link, not two.
export const clerkAppearanceInline = {
  elements: {
    ...SHARED_ELEMENTS,
    rootBox: "w-full",
    card: "shadow-none border-none bg-transparent p-0 w-full",
    header: "!hidden",
    footerAction: "!hidden",
  },
};
