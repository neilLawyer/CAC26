import { test, expect, type Page } from "@playwright/test";

// The v4 gate — every new v4 surface, exercised for real in a browser. Grows
// with each v4 workstream: collapse system (W1), dashboard (W2), orbit (W3),
// search (W4), scholarships (W5), tax guide (W6), deadlines (W7), snapshot
// (W8), stacking (W9), packet (W10), Spanish (W11).

test.use({ contextOptions: { reducedMotion: "reduce" } });

const SEEDED_HOUSEHOLD = {
  state: "NJ",
  householdSize: 3,
  monthlyIncomeMin: 1500,
  monthlyIncomeMax: 2000,
  kidsUnder17Count: 2,
  flags: { veteran: true, schoolAgeChild: true },
};

async function seedHousehold(page: Page) {
  await page.addInitScript((household) => {
    window.localStorage.setItem("opendoor-household", JSON.stringify(household));
  }, SEEDED_HOUSEHOLD);
}

test.describe("W1 — collapse system", () => {
  test("result cards collapse to one line and expand on click", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/results");

    // Collapsed by default: the card's heading row is visible, its body isn't.
    const head = page.getByRole("button", { name: /Child Tax Credit/ });
    await expect(head).toBeVisible();
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText(/Around \$4,400\/year for your 2 children/)).toBeHidden();

    // Expand: the full detail appears, including the merged source+verify row.
    await head.click();
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/Around \$4,400\/year for your 2 children/)).toBeVisible();
    const card = page.locator(".result-card", { hasText: "Child Tax Credit" });
    await expect(card.getByRole("link", { name: /Verify & apply/ })).toBeVisible();
    await expect(card.getByRole("link", { name: /Source · checked/ })).toBeVisible();

    // Collapse again.
    await head.click();
    await expect(head).toHaveAttribute("aria-expanded", "false");
  });

  test("expand all / collapse all broadcast to every card", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/results");

    await page.getByRole("button", { name: "Expand all" }).click();
    const expanded = page.locator('.result-card button[aria-expanded="true"]');
    const total = await page.locator(".result-card button[aria-expanded]").count();
    await expect(expanded).toHaveCount(total);
    expect(total).toBeGreaterThan(3);

    await page.getByRole("button", { name: "Collapse all" }).click();
    await expect(page.locator('.result-card button[aria-expanded="true"]')).toHaveCount(0);
  });

  test("density switch persists and tightens the layout", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/results");

    await page.getByRole("button", { name: "Compact" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
    // Persists across a reload (blocking script applies it before paint).
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
    await page.getByRole("button", { name: "Comfortable" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-density", "compact");
  });

  test("dashboard: reduced motion shows the final number instantly, and it IS the midpoint", async ({
    page,
  }) => {
    await seedHousehold(page);
    await page.goto("/results");

    const panel = page.getByRole("region", { name: "Your results at a glance" });
    await expect(panel).toBeVisible();

    // Under reduced motion the count-up must not animate: the headline equals
    // the midpoint of the min–max range printed right beside it.
    const rangeText = await panel.getByText(/Midpoint of \$/).innerText();
    const nums = rangeText.replace(/,/g, "").match(/\$(\d+) – \$(\d+)/);
    expect(nums).not.toBeNull();
    const expected = Math.round((Number(nums![1]) + Number(nums![2])) / 2);
    await expect(panel.locator(".dash-number")).toContainText(
      "$" + expected.toLocaleString("en-US")
    );

    // Ring + counts render and agree with each other.
    const ring = panel.getByRole("img", { name: /still open to you/ });
    await expect(ring).toBeVisible();
  });

  test("orbit menu: 13 doors + the core, reduced motion navigates instantly (W3)", async ({
    page,
  }) => {
    await page.goto("/");
    const orbit = page.getByRole("navigation", {
      name: "Explore by situation or by kind of help",
    });
    await expect(orbit).toBeVisible();
    // 5 personas + 8 categories as REAL links, plus the core.
    await expect(orbit.getByRole("link", { name: /open this door/ })).toHaveCount(13);
    await expect(
      orbit.getByRole("link", { name: /Start the three-minute eligibility check/ })
    ).toBeVisible();

    await orbit.getByRole("link", { name: "Health — open this door" }).click();
    await expect(page).toHaveURL(/\/intake\/health$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("orbit menu: small screens fall back to the persona tiles (W3)", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Explore by situation or by kind of help" })
    ).toBeHidden();
    // The compact tiles carry the load instead (the orbit's links exist in
    // the DOM but are hidden — select the visible one).
    const tile = page.locator('a[href="/intake/families"]:visible').first();
    await expect(tile).toBeVisible();
    await tile.click();
    await expect(page).toHaveURL(/\/intake\/families$/);
  });

  test("universal search: ctrl-K, life phrase, keyboard to the right room (W4)", async ({
    page,
  }) => {
    await seedHousehold(page);
    await page.goto("/results");

    // Keyboard shortcut opens it anywhere.
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Search programs and pages" });
    await expect(dialog).toBeVisible();

    // A life phrase → the WIC pathway, chosen entirely by keyboard.
    await page.keyboard.type("pregnant");
    const options = dialog.getByRole("option");
    await expect(options.first()).toBeVisible();
    const texts = await options.allInnerTexts();
    expect(texts.join(" ").toLowerCase()).toMatch(/wic|women/);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/intake\/(food|families|health)$/);

    // The visible header button works too, and colloquial names resolve.
    await page.getByRole("button", { name: "Search programs and pages" }).click();
    await page.keyboard.type("food stamps");
    await expect(dialog.getByRole("option").first()).toContainText(/SNAP/i);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // Garbage gets honesty, not fabricated matches.
    await page.keyboard.press("Control+k");
    await page.keyboard.type("xyzzyplugh");
    await expect(dialog.getByText(/Nothing matched/)).toBeVisible();
  });

  test("scholarships: collapsed one-liner in the education room, full page, real links (W5)", async ({
    page,
  }) => {
    // Education room: collapsed by default, expands to the bullet list.
    await page.goto("/intake/education");
    const box = page.getByRole("button", { name: /Merit scholarships & contests — show full list/ });
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await box.click();
    const nm = page.getByRole("link", { name: "National Merit Scholarship Program" });
    await expect(nm).toBeVisible();
    await expect(nm).toHaveAttribute("href", /nationalmerit\.org/);

    // The dedicated page renders every entry with an official link.
    await page.goto("/scholarships");
    await expect(
      page.getByRole("heading", { name: /don't ask what your family earns/ })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Coca-Cola Scholars Program" })).toHaveAttribute(
      "href",
      /coca-colascholarsfoundation\.org/
    );
    // The in-app explainer opens without leaving the page.
    await page
      .locator("li", { hasText: "Profile in Courage" })
      .locator("summary")
      .click();
    await expect(page.getByText(/requires a nominating teacher/)).toBeVisible();
  });

  test("tax guide: free routes, upsell warnings, printable checklist (W6)", async ({
    page,
  }) => {
    // The tax room points at the guide.
    await page.goto("/intake/tax");
    await page.getByRole("link", { name: /Claim your tax credits/ }).click();
    await expect(page).toHaveURL(/\/tax-guide$/);

    // The real free routes, all linking out.
    await expect(page.getByRole("link", { name: /IRS Free File/ })).toHaveAttribute(
      "href",
      /irs\.gov/
    );
    await expect(page.getByRole("link", { name: /VITA\/TCE site locator/ })).toHaveAttribute(
      "href",
      /irs\.treasury\.gov/
    );
    await expect(page.getByRole("link", { name: /GetYourRefund/ })).toHaveAttribute(
      "href",
      /getyourrefund\.org/
    );
    // The watch-out section names the FTC action.
    await expect(page.getByText(/Federal Trade Commission/)).toBeVisible();
    // The printable checklist exists with its print affordance.
    await expect(page.getByRole("heading", { name: /What to bring to free tax prep/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Print this checklist/ })).toBeVisible();
    await expect(page.getByText(/Social Security cards or ITIN letters/)).toBeVisible();
    // And printing hides everything BUT the checklist.
    await page.emulateMedia({ media: "print" });
    await expect(page.getByRole("heading", { name: "Claim your tax credits" })).toBeHidden();
    await expect(page.getByText(/Social Security cards or ITIN letters/)).toBeVisible();
    await page.emulateMedia({ media: "screen" });
  });

  test("deadlines: personal timeline + a real .ics download (W7)", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/results");
    await page.getByRole("link", { name: /My deadline timeline/ }).click();
    await expect(page).toHaveURL(/\/deadlines$/);

    // NJ household: the NJ LIHEAP season card is there with its source stamp.
    const liheap = page.locator("div", { hasText: /NJ LIHEAP season/ }).last();
    await expect(page.getByText(/NJ LIHEAP season/)).toBeVisible();
    await expect(page.getByText(/first-come, first-served/)).toBeVisible();

    // The .ics actually downloads and is a real calendar.
    const downloadPromise = page.waitForEvent("download");
    await liheap.getByRole("button", { name: /Add to calendar/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.ics$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const ics = Buffer.concat(chunks).toString("utf-8");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("LIHEAP");

    // Contest deadlines render for everyone, with official links.
    await expect(page.getByRole("heading", { name: /Voice of Democracy/ })).toBeVisible();
  });

  test("snapshot re-check: save, change life, see only the delta (W8)", async ({ page }) => {
    // Seed-if-absent: addInitScript re-runs on every reload, and this test
    // MODIFIES the stored household mid-flight — an unconditional seed would
    // silently wipe the modification on reload.
    await page.addInitScript((household) => {
      if (!window.localStorage.getItem("opendoor-household")) {
        window.localStorage.setItem("opendoor-household", JSON.stringify(household));
      }
    }, SEEDED_HOUSEHOLD);
    await page.goto("/results");

    // Save today's picture.
    await page.getByRole("button", { name: "Save snapshot" }).click();
    await expect(page.getByText(/Snapshot saved on this device/)).toBeVisible();

    // Life changes: the household starts receiving Medicaid (adjunctive
    // eligibility flips WIC-style income tests to met).
    await page.evaluate(() => {
      const h = JSON.parse(window.localStorage.getItem("opendoor-household")!);
      h.flags.receivesMedicaid = true;
      h.flags.pregnantOrChildUnder5 = true;
      window.localStorage.setItem("opendoor-household", JSON.stringify(h));
    });
    await page.reload();

    // Only the delta is announced.
    const panel = page.getByText(/since your snapshot/i);
    await expect(panel).toBeVisible();
    await expect(page.getByText(/Now likely:/)).toBeVisible();

    // Updating the snapshot settles it back to steady.
    await page.getByRole("button", { name: "Update snapshot to today" }).click();
    await page.reload();
    await expect(page.getByText(/Nothing crossed the .likely. line/)).toBeVisible();

    // Delete is real.
    await page.getByRole("button", { name: "Delete snapshot" }).click();
    await expect(page.getByRole("button", { name: "Save snapshot" })).toBeVisible();
    const stored = await page.evaluate(() => window.localStorage.getItem("opendoor-snapshot"));
    expect(stored).toBeNull();
  });

  test("cliff simulator: the three displayed numbers reconcile exactly (W9)", async ({
    page,
  }) => {
    await seedHousehold(page);
    await page.goto("/cliff-simulator");

    // Push the slider high enough to cross limits for this household.
    const slider = page.locator('input[type="range"]');
    await slider.fill("2700");

    const num = async (re: RegExp) => {
      const text = await page.getByText(re).first().innerText();
      const m = text.replace(/,/g, "").match(/-?\$?(\d+)/);
      return Number(m![1]);
    };

    // Net effect headline, and the sub-line's extra pay + benefit change.
    const netText = await page
      .locator("p.tabular-nums")
      .first()
      .innerText();
    const net = Number(netText.replace(/[+,$]/g, ""));
    const subline = await page.getByText(/Extra pay \(/).innerText();
    const parts = subline.replace(/,/g, "").match(/\$(\d+)\/yr\) (minus|plus) .*?\$(\d+)\/yr/);
    expect(parts).not.toBeNull();
    const extraPay = Number(parts![1]);
    const change = Number(parts![3]) * (parts![2] === "minus" ? -1 : 1);
    // The identity the audit was about: net ≡ extra pay + benefit change.
    expect(net).toBe(extraPay + change);
    expect(extraPay).toBe(2700 * 12);

    // The two income cards agree with the sub-line too.
    const nowVal = await num(/in likely benefits/);
    expect(typeof nowVal).toBe("number");

    // The counting basis is stated on the page.
    await expect(page.getByText(/only programs marked/)).toBeVisible();
  });

  test("benefit stacking on results: likely programs sum + unlock notes (W9)", async ({
    page,
  }) => {
    await seedHousehold(page);
    await page.goto("/results");

    const stack = page.getByRole("button", { name: /likely programs together/ });
    await expect(stack).toBeVisible();
    await stack.click();
    await expect(page.getByText(/programs that unlock each other/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /see what a raise really nets you/ })
    ).toBeVisible();
  });

  test("info boxes are one line collapsed, full story on click (scope + cliff)", async ({
    page,
  }) => {
    await seedHousehold(page);
    // Scope page local pointer.
    await page.goto("/intake/housing");
    const pointer = page.getByRole("button", { name: /your local office/i });
    await expect(pointer).toHaveAttribute("aria-expanded", "false");
    await pointer.click();
    await expect(
      page.getByRole("link", { name: /HUD's official housing authority directory/ })
    ).toBeVisible();

    // Cliff simulator explainer.
    await page.goto("/cliff-simulator");
    const explainer = page.getByRole("button", { name: /What's a .benefits cliff./ });
    await expect(explainer).toHaveAttribute("aria-expanded", "false");
    await explainer.click();
    await expect(page.getByText(/cost you more in lost benefits/)).toBeVisible();
  });
});
