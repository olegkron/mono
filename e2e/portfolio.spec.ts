import { expect, test } from "@playwright/test";

test("section navigation updates the home hash", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "projects", exact: true }).click();

  await expect(page).toHaveURL(/#projects$/);
  await expect(page.getByRole("link", { name: /View Project Alpha project/i })).toBeVisible();
});

test("unknown project routes redirect to the home page", async ({ page }) => {
  await page.goto("/projects/not-a-project");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Your Name" })).toBeVisible();
});

test("project images open and close as an accessible dialog", async ({ page }) => {
  await page.goto("/projects/project-alpha");

  await page.getByRole("button", { name: /Open Project Alpha screenshot placeholder/i }).click();
  await expect(page.getByRole("dialog", { name: /Project Alpha screenshot placeholder/i })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Project Alpha screenshot placeholder/i })).toBeHidden();
});

test("reduced motion disables mandatory scroll snapping", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const snapType = await page.locator("#root").evaluate((node) => getComputedStyle(node).scrollSnapType);
  const scrollBehavior = await page.locator("#root").evaluate((node) => getComputedStyle(node).scrollBehavior);

  expect(snapType).toBe("none");
  expect(scrollBehavior).toBe("auto");
});
