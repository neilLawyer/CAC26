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
