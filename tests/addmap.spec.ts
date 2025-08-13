import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const email = process.env.email as string;
const password = process.env.password as string;

const testPlace = {
  name: "London, England",
  summary: "A brief summary for the test",
  description:
    "This is a detailed description for the test place, which meets the minimum length requirement between 100-130 words in length.",
  link: "https://www.google.com/maps/d/edit?mid=15k4TAMYCI-fO1CILIvE49WvL3MUuc5o&ll=18.821200176016767%2C99.01981109999997&z=12",
};

const invalidLink =
  "  https://www.google.com/maps/d/edit?mid=1_RPx9Bicq7AwKXfvvxKVvXXmBFRU9t8&ll=14.516856203688954%2C99.93228540624999&z=6";

async function login(page: Page) {
  await page.goto("http://localhost:4321/signin");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL("http://localhost:4321/");
}

let page: Page;
let context: BrowserContext;

test.describe("Add a Map Functionality", () => {
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await login(page);
    await page.getByText("Add a map").click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test("should display the 'Create a map' dialog with all required fields", async () => {
    // Verifies the dialog opens with all inputs and the submit button is disabled until valid.
    await expect(
      page.getByRole("heading", { name: "Create a map" })
    ).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#summary")).toBeVisible();
    await expect(page.locator("#description")).toBeVisible();
    await expect(page.locator("#link")).toBeVisible();
    await expect(page.locator("#tag")).toBeVisible();
    const createButton = page.getByRole("button", { name: "Create Place" });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeDisabled();
  });

  test("should prevent form submission with missing required fields", async () => {
    // Ensures form cannot be submitted until all fields are filled and link is validated.
    await expect(
      page.getByRole("button", { name: "Create Place" })
    ).toBeDisabled();
    await page.fill("#link", testPlace.link);
    await page.getByRole("button", { name: "Validate" }).click();
    const validationMessage = page.locator("#link-validation-message");
    await expect(validationMessage).toBeVisible({ timeout: 30000 });
    await expect(
      page.getByRole("button", { name: "Create Place" })
    ).toBeEnabled();
    await page.getByRole("button", { name: "Create Place" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("should show a validation error for an invalid Google Maps embed link", async () => {
    // Confirms invalid map links trigger a proper error and disable submission.
    await page.fill("#link", invalidLink);
    await page.getByRole("button", { name: "Validate" }).click();
    const validationMessage = page.locator("#link-validation-message");
    await expect(validationMessage).toBeVisible({ timeout: 30000 });
    await expect(validationMessage).toHaveText(
      /Unable to reach the link|Link returned an error/
    );
    await expect(
      page.getByRole("button", { name: "Create Place" })
    ).toBeDisabled();
  });

  test("should show a format error for a non-Google Maps link", async () => {
    // Validates that non-Google URLs are rejected immediately due to format mismatch.
    const wrongFormatLink = "  https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    await page.fill("#link", wrongFormatLink);
    await page.getByRole("button", { name: "Validate" }).click();
    const validationMessage = page.locator("#link-validation-message");
    await expect(validationMessage).toBeVisible({ timeout: 30000 });
    await expect(validationMessage).toHaveText(
      "Invalid URL format. Must be a Google Maps embed link."
    );
    await expect(
      page.getByRole("button", { name: "Create Place" })
    ).toBeDisabled();
  });

  test("should enable the submit button after a valid link is validated", async () => {
    // Checks that a correct Google Maps embed link passes validation and enables submission.
    await page.fill("#name", "Valid Test Place");
    await page.fill("#summary", "Summary");
    await page.fill(
      "#description",
      "This is a detailed description for the test place."
    );
    await page.fill(
      "#link",
      "  https://www.google.com/maps/d/embed?mid=15k4TAMYCI-fO1CILIvE49WvL3MUuc5o&ehbc=2E312F"
    );
    await expect(
      page.getByRole("button", { name: "Create Place" })
    ).toBeDisabled();
    await page.getByRole("button", { name: "Validate" }).click();
    const validationMessage = page.locator("#link-validation-message");
    await expect(validationMessage).toBeVisible({ timeout: 30000 });
    await expect(validationMessage).toHaveText("Link is valid!");
    await expect(
      page.getByRole("button", { name: "Create Place" })
    ).toBeEnabled();
  });

  test("should successfully create a new place with valid data after link validation", async () => {
    // Tests full happy path: fill form, validate link, submit, and verify success.
    await page.fill("#name", testPlace.name);
    await page.fill("#summary", testPlace.summary);
    await page.fill("#description", testPlace.description);
    await page.fill("#link", testPlace.link);
    await page.getByRole("button", { name: "Validate" }).click();
    const validationMessage = page.locator("#link-validation-message");
    await expect(validationMessage).toBeVisible({ timeout: 30000 });
    await expect(validationMessage).toHaveText("Link is valid!");
    await expect(
      page.getByRole("button", { name: "Create Place" })
    ).toBeEnabled();
    await page.getByRole("button", { name: "Create Place" }).click();
    const dialog = page.locator("#createMap");
    await expect(dialog).not.toBeVisible();
    const imageCard = page.locator('li:has(img[alt="London, England"])');
    await expect(imageCard).toBeVisible();
  });

  test("should close the dialog when the 'X' button is clicked", async () => {
    // Ensures user can cancel creation by closing the dialog with the X button.
    await page.getByText("Add a map").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator("#close-dialog-button").click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should open the update modal and validate fields, link validation, and submission", async () => {
    // Verifies editing an existing map: modal opens, fields pre-fill, link re-validation works, and update submits.
    await page.goto("http://localhost:4321/maps");
    await page.waitForLoadState("networkidle");
    const placeName = testPlace.name;
    const rowLocator = page.locator(`tr:has(td:text-is("${placeName}"))`);
    await expect(rowLocator).toBeVisible();
    const updateButton = rowLocator.getByRole("button", {
      name: "Update button",
    });
    await expect(updateButton).toBeVisible();
    await updateButton.click();
    const modal = page.locator("dialog:visible");
    await expect(page.locator("dialog:visible")).toBeVisible();
    await expect(modal.locator('[id*="update-name"]').first()).toHaveValue(
      testPlace.name
    );
    await expect(modal.locator("#summary")).toHaveValue(testPlace.summary);
    await expect(modal.locator("#description")).toHaveValue(
      testPlace.description
    );
    await expect(modal.locator("#link")).toHaveValue(testPlace.link);
    await expect(modal.locator("#tag")).toHaveValue("food");

    const submitButton = page.getByRole("button", { name: "Update Place" });
    await expect(submitButton).toBeEnabled();

    const linkInput = modal.locator("#link");
    await linkInput.fill(invalidLink.trim());
    await expect(submitButton).toBeDisabled();

    await modal.getByRole("button", { name: "Validate" }).click();
    const validationMessage = modal.locator("#update-validation");
    await expect(validationMessage).toBeVisible();
    await expect(validationMessage).toHaveText(
      /Invalid URL format|Unable to reach the link/
    );
    await expect(submitButton).toBeDisabled();

    await linkInput.fill(
      "https://www.google.com/maps/d/embed?mid=15k4TAMYCI-fO1CILIvE49WvL3MUuc5o&ehbc=2E312F"
    );
    await modal.getByRole("button", { name: "Validate" }).click();
    await expect(validationMessage).toHaveText("✅ Valid Google My Maps link!");
    await expect(submitButton).toBeEnabled();

    await modal.locator('[id*="update-name"]').fill("Updated London");
    await modal.locator("#summary").fill("Updated summary");

    const generateButton = page.getByRole("button", { name: "AI Generate" });
    await expect(generateButton).not.toBeDisabled();

    await submitButton.click();
    await expect(
      page.getByRole("heading", { name: "Edit this map", level: 2 })
    ).not.toBeVisible({ timeout: 15000 });

    await page.goto("http://localhost:4321/maps");
    await expect(
      page.locator(`tr:has(td:text-is("Updated London"))`)
    ).toBeVisible();
  });

  test("should successfully delete the 'London, UK' map", async () => {
    // Tests deletion flow: find row, click delete, confirm, and verify removal.
    await page.goto("http://localhost:4321/maps");
    const rowLocator = page.locator(`tr:has-text("Updated London")`);
    await expect(rowLocator).toBeVisible();
    const deleteButton = rowLocator.getByRole("button", {
      name: "Delete button",
    });
    await deleteButton.click();
    await page.getByRole("button", { name: "Yes", exact: true }).click();
    await expect(rowLocator).not.toBeVisible();
  });
});
