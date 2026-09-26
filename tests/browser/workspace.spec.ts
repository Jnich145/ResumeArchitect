import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { sampleDocument, STORAGE_KEY } from "../../src/document";

test("a stale tab needs explicit confirmation to replace a newer saved draft", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await page.getByLabel("Full name", { exact: true }).fill("First tab");
  await page.getByRole("button", { name: "Save on this browser" }).click();
  await expect(other.getByRole("status")).toContainText("another tab");
  await other.getByLabel("Full name", { exact: true }).fill("Second tab");
  other.once("dialog", (dialog) => dialog.dismiss());
  await other.getByRole("button", { name: "Save on this browser" }).click();
  expect(
    await other.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).contact.name,
      STORAGE_KEY,
    ),
  ).toBe("First tab");
  other.once("dialog", (dialog) => dialog.accept());
  await other.getByRole("button", { name: "Save on this browser" }).click();
  expect(
    await other.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).contact.name,
      STORAGE_KEY,
    ),
  ).toBe("Second tab");
});

test("edit, explicitly save, reload, export, import, and clear a draft", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4175/"))
      external.push(request.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make your next chapter count." }),
  ).toBeVisible();
  if (process.env.CAPTURE_SCREENSHOTS) {
    await page.screenshot({
      path: testInfo.outputPath(`workspace-${testInfo.project.name}.png`),
      fullPage: true,
    });
  }
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
  await page.getByLabel("Full name", { exact: true }).fill("Taylor Example");
  await page
    .getByLabel("Role 1", { exact: true })
    .fill("Accessibility Engineer");
  await page.getByLabel("Layout", { exact: true }).selectOption("modern");
  const preview = page.getByRole("article", { name: "Resume preview" });
  await expect(preview.getByText("Taylor Example")).toBeVisible();
  await expect(preview.getByText("Accessibility Engineer")).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
  await page.getByRole("button", { name: "Save on this browser" }).click();
  await page.reload();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Taylor Example",
  );
  await expect(page.getByLabel("Layout", { exact: true })).toHaveValue(
    "modern",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON" }).click();
  const download = await downloadPromise;
  const content = await readFile((await download.path())!, "utf8");
  expect(JSON.parse(content).contact.name).toBe("Taylor Example");
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear local data" }).click();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
  await page.getByLabel("Import resume file").setInputFiles({
    name: "resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(content),
  });
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Taylor Example",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
  await page.getByRole("button", { name: "Save on this browser" }).click();
  await page.reload();
  await expect(preview.getByText("Accessibility Engineer")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("untrusted imports render as text and invalid files preserve the current draft", async ({
  page,
}) => {
  await page.goto("/");
  const document = sampleDocument();
  document.contact.name =
    '<img src="https://example.com/leak" onerror="alert(1)">';
  document.contact.website = "javascript:alert(1)";
  await page.getByLabel("Import resume file").setInputFiles({
    name: "resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  const preview = page.getByRole("article", { name: "Resume preview" });
  await expect(
    preview.getByRole("heading", { name: document.contact.name, exact: true }),
  ).toBeVisible();
  await expect(preview.locator("img, script, a")).toHaveCount(0);
  await page.getByLabel("Import resume file").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{bad"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "valid ResumeArchitect JSON",
  );
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    document.contact.name,
  );
  await page.getByLabel("Import resume file").setInputFiles({
    name: "large.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(128 * 1024 + 1),
  });
  await expect(page.getByRole("alert")).toContainText("128 KiB");
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    document.contact.name,
  );
});

test("corrupt or blocked storage never crashes or reports a false save", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken"),
    STORAGE_KEY,
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "has not been overwritten",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe("{broken");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
  });
  await page.getByRole("button", { name: "Save on this browser" }).click();
  await expect(page.getByRole("alert")).toContainText("Could not save");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON" }).click();
  expect((await download).suggestedFilename()).toBe("resume-architect.json");
});

test("cancel keeps an unsaved draft and add/remove sections updates the preview", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add experience" }).click();
  await page.getByLabel("Role 2", { exact: true }).fill("Research Assistant");
  await expect(
    page.getByRole("article").getByText("Research Assistant"),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Clear local data" }).click();
  await expect(page.getByLabel("Role 2", { exact: true })).toHaveValue(
    "Research Assistant",
  );
  await page.getByRole("button", { name: "Remove experience 2" }).click();
  await expect(
    page.getByRole("article").getByText("Research Assistant"),
  ).toHaveCount(0);
});

test("an in-flight import cannot overwrite a newer edit", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const read = File.prototype.text;
    File.prototype.text = async function () {
      const content = await read.call(this);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return content;
    };
  });
  await page.getByLabel("Import resume file").setInputFiles({
    name: "resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(sampleDocument())),
  });
  await page.getByLabel("Full name", { exact: true }).fill("Newer edit");
  await expect(page.getByRole("alert")).toContainText(
    "draft changed while the file was loading",
  );
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Newer edit",
  );
});

test("print output hides editor controls and produces a multi-page text PDF", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const document = sampleDocument();
  document.experience = Array.from({ length: 12 }, (_, i) => ({
    ...document.experience[0],
    role: `Synthetic role ${i + 1}`,
  }));
  await page.getByLabel("Import resume file").setInputFiles({
    name: "long.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("button", { name: "Save on this browser" }),
  ).toBeHidden();
  await expect(
    page
      .getByRole("article")
      .getByRole("heading", { name: "Synthetic role 12", exact: true }),
  ).toBeVisible();
  const pdf = await page.pdf({
    path: testInfo.outputPath("synthetic-resume.pdf"),
    preferCSSPageSize: true,
  });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  expect(
    (pdf.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length,
  ).toBeGreaterThan(1);
  // Chrome embeds a font and character mapping for selectable text, not a screenshot.
  expect(pdf.toString("latin1")).toContain("/ToUnicode");
});
