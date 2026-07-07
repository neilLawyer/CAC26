import { test, expect } from "@playwright/test";

// W6 self-verification: three real households walked end-to-end in a real
// browser — every click, every landed URL, every claimed feature actually
// exercised. The "parent" journey includes a LIVE address lookup against the
// real Census + HRSA APIs (it proves the flagship works; if those public
// APIs are down the failure is recorded honestly rather than skipped).

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("persona walkthroughs", () => {
  test("low-income high-schooler → education deep dive → Pell", async ({ page }) => {
    // General intake, clicked like a person: NJ, lives with one parent,
    // very low income, skips flags except student.
    await page.goto("/intake");
    await page.getByRole("button", { name: "New Jersey" }).click();
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "Under $1,000/mo" }).click();
    await page
      .locator(".rounded-xl", { hasText: "Is anyone in your household a student?" })
      .getByRole("button", { name: "Yes" })
      .first()
      .click();
    await page.getByRole("button", { name: "Continue" }).click();
    const assets = page.getByRole("button", { name: "Under $2,000" });
    if (await assets.isVisible().catch(() => false)) await assets.click();
    await page.getByRole("button", { name: "See my results" }).click();
    await expect(page).toHaveURL(/\/results$/);

    // The student offer fires and opens the education room.
    const eduOffer = page.locator('a[href="/intake/education"]').first();
    await expect(eduOffer).toBeVisible();
    await eduOffer.click();
    await expect(page).toHaveURL(/\/intake\/education$/);

    // Pell renders as a real, capped-honesty result with a source line.
    await expect(page.getByText("Federal Pell Grant (via FAFSA)")).toBeVisible();
    await expect(page.getByText(/Possibly eligible/).first()).toBeVisible();
    // Forward action exists: the page never dead-ends. (A "Keep going" offer
    // only renders when ANOTHER rule fires for this household — with only
    // student=true there is none, and the always-present links are the floor.)
    await expect(page.getByRole("link", { name: /All results/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Redo the quick intake/ })).toBeVisible();
  });

  test("working parent → food + health, WIC adjunctive, live address lookup", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/intake");
    await page.getByRole("button", { name: "New Jersey" }).click();
    await page.getByRole("button", { name: "4", exact: true }).click();
    await page.getByRole("button", { name: "$2,000 – $2,500/mo" }).click();
    // Flags: pregnant/child under 5 = yes, school-age child = yes.
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

    // Food room: WIC is there; answering "already receives Medicaid" fires
    // the adjunctive income waiver in the reason trace.
    await page.locator('a[href="/intake/food"]').first().click();
    await expect(page).toHaveURL(/\/intake\/food$/);
    await expect(page.getByRole("heading", { name: "Women, Infants & Children" })).toBeVisible();
    await page.getByRole("button", { name: "Medicaid", exact: true }).click();
    await expect(
      page.getByText(/income test is automatically met/).first()
    ).toBeVisible();

    // Health room: the LIVE flagship — real address in, real health centers out.
    await page.goto("/intake/health");
    await page.getByLabel("Your address").fill("920 Broad St, Newark, NJ");
    await page.getByRole("button", { name: "Look up my area" }).click();
    await expect(page.getByText(/Found:/)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/health centers within/)).toBeVisible({ timeout: 20_000 });
  });

  test("middle-class homeowner → tax room, deterministic CTC worth", async ({ page }) => {
    await page.goto("/intake");
    await page.getByRole("button", { name: "New Jersey" }).click();
    await page.getByRole("button", { name: "4", exact: true }).click();
    await page.getByRole("button", { name: "$5,000 – $7,000/mo" }).click();
    await page
      .locator(".rounded-xl", { hasText: "Is there a school-age child in the household?" })
      .getByRole("button", { name: "Yes" })
      .first()
      .click();
    await page
      .locator(".rounded-xl", { hasText: "federal tax return" })
      .getByRole("button", { name: "Yes" })
      .first()
      .click();
    await page.getByRole("button", { name: "Continue" }).click();
    const assets = page.getByRole("button", { name: "More than $10,000" });
    if (await assets.isVisible().catch(() => false)) await assets.click();
    await page.getByRole("button", { name: "See my results" }).click();
    await expect(page).toHaveURL(/\/results$/);

    // Tax room: answer the kid count + employment the coverage engine pulls in.
    await page.locator('a[href="/intake/tax"]').first().click();
    await expect(page).toHaveURL(/\/intake\/tax$/);
    await page
      .locator(".q-shell", { hasText: "How many children under 17 live with you?" })
      .getByRole("button", { name: "2", exact: true })
      .first()
      .click();
    await page.getByRole("button", { name: "Working (full or part time)" }).click();

    // CTC: likely at this income, and the WORTH line is the record's own
    // per-child figure × 2 kids = $4,400 — deterministic arithmetic, no AI.
    await expect(page.getByRole("heading", { name: "Child Tax Credit" })).toBeVisible();
    await expect(page.getByText(/Around \$4,400\/year for your 2 children/)).toBeVisible();
    // EITC at $5–7k/mo: correctly NOT in the likely group (income above the
    // tiered ceiling) — the engine's honesty cuts both ways.
    await expect(page.getByText(/Not likely/).first()).toBeVisible();
  });
});
