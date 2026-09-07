import { expect, test } from "@playwright/test";

test("producer can discover an instrument and save it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Keys", exact: true }).click();
  await expect(page.getByRole("heading", { name: "The Parlour Harmonium" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Midnight Cello" })).toHaveCount(0);
  await page.getByRole("button", { name: "Save The Parlour Harmonium" }).click();
  await page.reload();
  await page.getByRole("button", { name: /My collection/ }).click();
  await expect(page.getByRole("heading", { name: "The Parlour Harmonium" })).toBeVisible();
});

test("search has a recoverable empty state and details work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Search instruments" }).fill("nothing-matches");
  await expect(page.getByRole("heading", { name: "No sounds found." })).toBeVisible();
  await page.getByRole("button", { name: "Explore all instruments" }).click();
  await page.getByRole("button", { name: "Midnight Cello", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("artist can calculate the default royalty split", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Artist studio", exact: true }).click();
  await page.getByRole("button", { name: "Calculate split" }).click();
  await expect(page.getByText("$2,940", { exact: true })).toBeVisible();
  await expect(page.getByText("$1,960", { exact: true })).toBeVisible();
});

test("mobile catalog fits the viewport and preview can play", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Preview The Parlour Harmonium" }).click();
  await expect(page.getByRole("button", { name: "Stop The Parlour Harmonium" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("collection export contains only saved demo entries", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Save Midnight Cello" }).click();
  await page.getByRole("button", { name: /My collection/ }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export list" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("reedroom-collection.json");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const contents = JSON.parse(Buffer.concat(chunks).toString());
  expect(contents.demo).toBe(true);
  expect(contents.instruments.map((instrument: { id: string }) => instrument.id)).toEqual(["cello"]);
});
