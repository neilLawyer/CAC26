import { test, expect } from "@playwright/test";

// W13 — the v4 walkthrough: one continuous journey through every v4 surface,
// clicked in a real browser WITH ANIMATIONS ENABLED (real conditions; the
// rest of the suite runs reduced-motion for determinism). Every step logs
// what was clicked and where it landed; the assertions are the record.

test.use({ contextOptions: { reducedMotion: "no-preference" } });

test("the full v4 journey: orbit → intake → dashboard → cards → search → scholarships → tax guide → deadlines → stacking → cliff → español → packet", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const log: string[] = [];
  const step = (s: string) => {
    log.push(s);
    console.log("  ▸ " + s);
  };

  // 1 — The orbit. Enter to pause the sky, then walk through a door.
  await page.goto("/");
  const orbit = page.getByRole("navigation", { name: /Explore by situation/ });
  await orbit.scrollIntoViewIfNeeded();
  await orbit.hover();
  await orbit.getByRole("link", { name: "Families — open this door" }).click();
  await expect(page).toHaveURL(/\/intake\/families$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  step("orbit: hover paused the sky, Families node → /intake/families");

  // 2 — The intake, clicked like a person.
  await page.goto("/intake");
  await page.getByRole("button", { name: "New Jersey" }).click();
  await page.getByRole("button", { name: "4", exact: true }).click();
  await page.getByRole("button", { name: "$2,000 – $2,500/mo" }).click();
  await page
    .locator(".rounded-xl", { hasText: "Is anyone pregnant, or is there a child under 5?" })
    .getByRole("button", { name: "Yes" })
    .first()
    .click();
  await page
    .locator(".rounded-xl", { hasText: "Is there a school-age child in the household?" })
    .getByRole("button", { name: "Yes" })
    .first()
    .click();
  await page.getByRole("button", { name: "Continue" }).click();
  const assets = page.getByRole("button", { name: "Under $2,000" });
  if (await assets.isVisible().catch(() => false)) await assets.click();
  await page.getByRole("button", { name: "See my results" }).click();
  await expect(page).toHaveURL(/\/results$/);
  step("intake: NJ → 4 people → $2–2.5k/mo → pregnant + school-age → /results");

  // 3 — The dashboard count-up settles on the true midpoint (animations ON).
  const panel = page.getByRole("region", { name: "Your results at a glance" });
  await expect(panel).toBeVisible();
  await page.waitForTimeout(1800); // let the count-up finish
  const rangeText = await panel.getByText(/Midpoint of \$/).innerText();
  const nums = rangeText.replace(/,/g, "").match(/\$(\d+) – \$(\d+)/);
  expect(nums).not.toBeNull();
  const midpoint = Math.round((Number(nums![1]) + Number(nums![2])) / 2);
  await expect(panel.locator(".dash-number")).toContainText(
    "$" + midpoint.toLocaleString("en-US")
  );
  step(`dashboard: count-up settled on ${"$" + midpoint.toLocaleString("en-US")} = the midpoint of its own displayed range`);

  // 4 — Cards: one line collapsed; expand → full detail; expand/collapse all.
  const wicHead = page.getByRole("button", { name: /Women, Infants & Children/ }).first();
  await expect(wicHead).toHaveAttribute("aria-expanded", "false");
  await wicHead.click();
  await expect(wicHead).toHaveAttribute("aria-expanded", "true");
  const wicCard = page.locator(".result-card", { hasText: "Women, Infants" }).first();
  await expect(wicCard.getByRole("link", { name: /Verify & apply/ })).toBeVisible();
  await wicHead.click();
  await page.getByRole("button", { name: "Expand all" }).click();
  await expect(page.locator('.result-card button[aria-expanded="false"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Collapse all" }).click();
  await expect(page.locator('.result-card button[aria-expanded="true"]')).toHaveCount(0);
  step("cards: WIC expanded to full detail (merged verify+source row), expand/collapse all broadcast");

  // 5 — Universal search: colloquial name → the right room.
  await page.keyboard.press("Control+k");
  await page.keyboard.type("food stamps");
  const dialog = page.getByRole("dialog", { name: /Search programs/ });
  await expect(dialog.getByRole("option").first()).toContainText(/SNAP/i);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/intake\/food$/);
  step('search: ctrl-K, "food stamps" → SNAP → landed /intake/food');

  // 6 — Scholarships: collapsed one-liner in the education room → real links.
  await page.goto("/intake/education");
  await page
    .getByRole("button", { name: /Merit scholarships & contests — show full list/ })
    .click();
  const nm = page.getByRole("link", { name: "National Merit Scholarship Program" });
  await expect(nm).toHaveAttribute("href", /nationalmerit\.org/);
  step("scholarships: education room list expanded, National Merit links to nationalmerit.org");

  // 7 — Tax guide via the tax room's pointer card.
  await page.goto("/intake/tax");
  await page.getByRole("link", { name: /Claim your tax credits/ }).click();
  await expect(page).toHaveURL(/\/tax-guide$/);
  await expect(page.getByRole("link", { name: /IRS Free File/ })).toHaveAttribute(
    "href",
    /irs\.gov/
  );
  await expect(page.getByRole("button", { name: /Print this checklist/ })).toBeVisible();
  step("tax guide: tax room → /tax-guide, IRS Free File link + printable checklist present");

  // 8 — Deadlines: a real .ics leaves the browser.
  await page.goto("/results");
  await page.getByRole("link", { name: /deadline timeline/ }).click();
  await expect(page).toHaveURL(/\/deadlines$/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Add to calendar/ }).first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.ics$/);
  step(`deadlines: downloaded ${download.suggestedFilename()} (on-device .ics)`);

  // 9 — Benefit stacking.
  await page.goto("/results");
  await page.getByRole("button", { name: /likely programs together/ }).click();
  await expect(page.getByText(/programs that unlock each other/)).toBeVisible();
  step("stacking: combined range + rule-derived unlock notes visible");

  // 10 — The cliff, at the audited +$2,700 scenario: the identity must hold.
  await page.goto("/cliff-simulator");
  await page.locator('input[type="range"]').fill("2700");
  await page.waitForTimeout(900); // count-up settles
  const netText = await page.locator("p.tabular-nums").first().innerText();
  const net = Number(netText.replace(/[+,$−−]/g, "")) * (netText.includes("−") ? -1 : 1);
  const subline = await page.getByText(/Extra pay \(/).innerText();
  const parts = subline.replace(/,/g, "").match(/\$(\d+)\/yr\) (minus|plus) .*?\$(\d+)\/yr/);
  const extraPay = Number(parts![1]);
  const change = Number(parts![3]) * (parts![2] === "minus" ? -1 : 1);
  expect(extraPay).toBe(32_400);
  expect(net).toBe(extraPay + change);
  await expect(page.getByText(/only programs marked/)).toBeVisible();
  step(
    `cliff: +$2,700/mo → extra pay $32,400, change ${change >= 0 ? "+" : ""}${change}, net ${net} — identity holds, basis stated on-page`
  );

  // 11 — Español.
  await page.getByRole("button", { name: "Cambiar a español" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.goto("/results");
  await expect(page.getByRole("heading", { name: "Esto es lo que encontramos" })).toBeVisible();
  await expect(page.getByText(/se muestran en inglés por ahora/)).toBeVisible();
  await page.getByRole("button", { name: "Switch to English" }).click();
  step("español: toggle flipped chrome + lang attr, honesty note shown, toggled back");

  // 12 — The packet.
  await page.goto("/packet");
  await expect(
    page.getByRole("heading", { name: /What this household may qualify for/ })
  ).toBeVisible();
  await expect(page.getByText(/Photo ID for the person applying/)).toHaveCount(1);
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("navigation").first()).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  step("packet: programs + ONE deduped checklist; print emulation drops the chrome");

  console.log("\n  WALKTHROUGH COMPLETE — " + log.length + " stations, all green\n");
});
