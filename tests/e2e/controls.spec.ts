import { test, expect, type Page } from "@playwright/test";

// THE CORRECTNESS GATE — every interactive control, actually clicked in a
// real browser, judged only by where the click lands. Reading code does not
// count as proof; this suite is the proof, and it stays in the repo so a
// dead control can never survive "verification" again.
//
// The main suite runs with reduced motion for determinism; a dedicated test
// at the bottom re-checks a sample of controls WITH animations enabled,
// since animation CSS was a suspect in the original "Health tab does
// nothing" bug report.

test.use({ contextOptions: { reducedMotion: "reduce" } });

const CATEGORY_IDS = [
  "food",
  "health",
  "energy",
  "cash",
  "education",
  "housing",
  "tax",
  "phone-internet",
];
const PERSONA_IDS = ["seniors", "families", "veterans", "students", "immigrants"];

// A household that makes /results render fully: NJ family, low income, a
// veteran + school-age child so persona spotlights and most tabs appear.
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

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

test.describe("home page controls", () => {
  test("nav links land where they claim", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Check eligibility" }).click();
    await expect(page).toHaveURL(/\/intake$/);

    await page.getByRole("navigation").getByRole("link", { name: "My results" }).click();
    await expect(page).toHaveURL(/\/results$/);

    await page.getByRole("navigation").getByRole("link", { name: "Cliff simulator" }).click();
    await expect(page).toHaveURL(/\/cliff-simulator$/);

    await page.getByRole("link", { name: /OpenDoor/ }).first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("hero CTA and how-it-works anchor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Check my eligibility" }).first().click();
    await expect(page).toHaveURL(/\/intake$/);

    await page.goto("/");
    await page.getByRole("link", { name: /See how it works/ }).click();
    await expect(page).toHaveURL(/#how-it-works$/);
    await expect(page.locator("#how-it-works")).toHaveCount(1);
  });

  for (const id of PERSONA_IDS) {
    test(`persona card → /intake/${id}`, async ({ page }) => {
      await page.goto("/");
      await page.locator(`a[href="/intake/${id}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`/intake/${id}$`));
      // The scope page actually rendered (not a 404 shell).
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  for (const id of CATEGORY_IDS) {
    test(`category tile → /intake/${id} (the reported dead-tile bug)`, async ({ page }) => {
      await page.goto("/");
      await page.locator(`a[href="/intake/${id}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`/intake/${id.replace("&", "\\&")}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("final CTA and footer links", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Check my eligibility" }).last().click();
    await expect(page).toHaveURL(/\/intake$/);

    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);

    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "How it works" }).click();
    await expect(page).toHaveURL(/\/how-it-works$/);

    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Check eligibility" }).click();
    await expect(page).toHaveURL(/\/intake$/);
  });

  test("theme toggle actually toggles", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const wasDark = await html.evaluate((el) => el.classList.contains("dark"));
    await page.getByRole("button", { name: /Switch to (light|dark) theme/ }).click();
    await expect(html).toHaveClass(wasDark ? /^(?!.*dark).*$/ : /dark/);
  });

  test("slideshow dots switch slides", async ({ page }) => {
    await page.goto("/");
    const dots = page.getByRole("tab");
    await dots.nth(2).click();
    await expect(dots.nth(2)).toHaveAttribute("aria-selected", "true");
  });
});

// ---------------------------------------------------------------------------
// /for/[population] marketing pages
// ---------------------------------------------------------------------------

test.describe("persona landing CTAs", () => {
  test("veterans landing routes to the veterans deep form", async ({ page }) => {
    await page.goto("/for/veterans");
    await page.getByRole("link", { name: "See what fits your situation" }).click();
    await expect(page).toHaveURL(/\/intake\/veterans$/);

    await page.goto("/for/veterans");
    await page.getByRole("link", { name: "Full eligibility check" }).click();
    await expect(page).toHaveURL(/\/intake$/);
  });
});

// ---------------------------------------------------------------------------
// /results hub (seeded household)
// ---------------------------------------------------------------------------

test.describe("results hub controls", () => {
  test("guard link without answers", async ({ page }) => {
    await page.goto("/results");
    await page.getByRole("link", { name: /Go to the questionnaire/ }).click();
    await expect(page).toHaveURL(/\/intake$/);
  });

  test("every rendered category tab navigates to its deep-dive page", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/results");
    // Collect the tabs that rendered, then click each one in turn.
    const hrefs = await page
      .locator('section:has(h2:text("Dig deeper by category")) a')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      await seedHousehold(page);
      await page.goto("/results");
      await page.locator(`a[href="${href}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`${href!.replace("&", "\\&")}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("persona spotlight deep link", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/results");
    await page.getByRole("link", { name: /Go deeper: the veterans questions/ }).click();
    await expect(page).toHaveURL(/\/intake\/veterans$/);
  });

  test("footer actions: edit, cliff simulator, clear", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/results");
    await page.getByRole("link", { name: /Edit my answers/ }).click();
    await expect(page).toHaveURL(/\/intake$/);

    await seedHousehold(page);
    await page.goto("/results");
    await page.getByRole("link", { name: /benefits-cliff simulator/ }).click();
    await expect(page).toHaveURL(/\/cliff-simulator$/);

    await seedHousehold(page);
    await page.goto("/results");
    await page.getByRole("button", { name: "Clear my answers" }).click();
    await expect(page.getByText("We need a few answers first.")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// General intake wizard — click through the whole flow
// ---------------------------------------------------------------------------

test("intake wizard end to end: answers land on /results", async ({ page }) => {
  await page.goto("/intake");
  await page.getByRole("button", { name: "New Jersey" }).click();
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByRole("button", { name: "$1,500 – $2,000/mo" }).click();
  // Flags step: skip everything via Continue.
  await page.getByRole("button", { name: "Continue" }).click();
  // The adaptive savings step appears when an asset-tested program (SSI) is
  // still alive — with all flags skipped, it is. Answer it if shown.
  const assetsChoice = page.getByRole("button", { name: "Under $2,000" });
  if (await assetsChoice.isVisible().catch(() => false)) {
    await assetsChoice.click();
  }
  await page.getByRole("button", { name: "See my results" }).click();
  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Here's what we found")).toBeVisible();
});

// ---------------------------------------------------------------------------
// Scope pages: internal links + external-link integrity
// ---------------------------------------------------------------------------

test.describe("scope page links", () => {
  test("housing page internal links", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/intake/housing");
    await page.getByRole("link", { name: /All results/ }).click();
    await expect(page).toHaveURL(/\/results$/);

    await page.goto("/intake/housing");
    await page.getByRole("link", { name: /Redo the quick intake/ }).click();
    await expect(page).toHaveURL(/\/intake$/);
  });

  test("external links carry real https hrefs and safe rel", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/intake/housing");
    const externals = page.locator('a[target="_blank"]');
    const count = await externals.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await externals.nth(i).getAttribute("href");
      const rel = await externals.nth(i).getAttribute("rel");
      expect(href, `external link ${i} must be https`).toMatch(/^https:\/\//);
      expect(rel, `external link ${i} must be noopener`).toContain("noopener");
    }
  });

  test("unknown scope 404s", async ({ page }) => {
    const response = await page.goto("/intake/nonsense");
    expect(response?.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Adaptive branching: offers render for the household's situation and open
// their destination forms (results must never dead-end).
// ---------------------------------------------------------------------------

test.describe("adaptive branching offers", () => {
  test("veteran household gets a veterans offer that opens the veterans form", async ({ page }) => {
    await seedHousehold(page); // seeded flags include veteran: true
    await page.goto("/results");
    const offer = page
      .locator('section:has(h2:text("Made for your situation")) a[href="/intake/veterans"]')
      .first();
    await expect(offer).toBeVisible();
    await offer.click();
    await expect(page).toHaveURL(/\/intake\/veterans$/);
  });

  test("scope pages carry a cross-offer so nothing dead-ends", async ({ page }) => {
    await seedHousehold(page);
    await page.goto("/intake/veterans");
    const keepGoing = page.locator('section:has(h2:text("Keep going")) a').first();
    await expect(keepGoing).toBeVisible();
    const href = await keepGoing.getAttribute("href");
    expect(href).toMatch(/^\/intake\//);
    expect(href).not.toBe("/intake/veterans");
    await keepGoing.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });
});

// ---------------------------------------------------------------------------
// Cliff simulator
// ---------------------------------------------------------------------------

test("cliff simulator slider and back link", async ({ page }) => {
  await seedHousehold(page);
  await page.goto("/cliff-simulator");
  await expect(page.getByText("Benefits-cliff simulator")).toBeVisible();
  const slider = page.locator('input[type="range"]');
  await slider.fill("1000");
  await expect(slider).toHaveValue("1000");
  // Baseline income = midpoint of the seeded $1,500–$2,000 bucket ($1,750);
  // +$1,000 → the hypothetical column must show $2,750/mo.
  await expect(page.getByText("$2,750/mo income")).toBeVisible();
  await page.getByRole("link", { name: /Back to my results/ }).click();
  await expect(page).toHaveURL(/\/results$/);
});

// ---------------------------------------------------------------------------
// Motion-enabled re-check: the original bug theory implicated animation CSS,
// so prove a sample of controls is clickable WITH animations running.
// ---------------------------------------------------------------------------

test.describe("with animations enabled", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("health tile and health results tab both navigate (the reported bug)", async ({ page }) => {
    await page.goto("/");
    // v4: the first health link is now an orbit node, which MOVES while
    // animations run. Entering the orbit pauses the sky — same as a real
    // pointer — and only then is the node click-stable.
    await page.getByRole("navigation", { name: /Explore by situation/ }).hover();
    await page.locator('a[href="/intake/health"]').first().click();
    await expect(page).toHaveURL(/\/intake\/health$/);

    await seedHousehold(page);
    await page.goto("/results");
    await page
      .locator('section:has(h2:text("Dig deeper by category")) a[href="/intake/health"]')
      .click();
    await expect(page).toHaveURL(/\/intake\/health$/);
    await expect(page.getByRole("heading", { level: 1, name: "Health" })).toBeVisible();
  });
});
