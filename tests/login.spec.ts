import { test, expect, type Page } from "@playwright/test";

// Use the credentials you provided in the prompt.
// NOTE: For a real-world scenario, these should be stored in a secure environment
// variable or a separate config file, not hard-coded.
const email = process.env.email as string;
const password = process.env.password as string;

const invalidPassword = "wrongpassword";

// This block runs before each test to navigate to the sign-in page.
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4321/signin");
});

// A test suite for the sign-in form.
test.describe("Login Form Functionality", () => {
  // Test 1: Successful login with valid credentials.
  test("should successfully sign in with correct credentials", async ({
    page,
  }) => {
    // Fill in the email and password fields.
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Click the submit button.
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    // Assuming a successful login redirects the user to the homepage ('/').
    // You should replace this with the actual URL or element you expect to see.
    // For example, if it redirects to a dashboard, you might check for '/dashboard'.
    await page.waitForURL("http://localhost:4321/");

    // Optional: You could also assert that a specific element on the new page is visible.
    // For example, `await expect(page.locator("h1")).toHaveText("Welcome, User!");`
  });

  // Test 2: Unsuccessful login with an invalid password.
  test("should show an error message for incorrect password", async ({
    page,
  }) => {
    // Fill in the email with valid credentials and a wrong password.
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', invalidPassword);

    // Click the submit button.
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    // Wait for the error message element to become visible.
    const errorMessage = page.locator("#error");
    await expect(errorMessage).toBeVisible();

    // Check that the error message contains some text.
    // You might want to assert for a specific error message, like "Invalid credentials."
    await expect(errorMessage).not.toBeEmpty();
  });

  // Test 3: Check the "Sign up here" link.
  test("should navigate to the sign-up page when clicking the sign-up link", async ({
    page,
  }) => {
    // Find the link by its text and click it.
    await page.getByRole("link", { name: "Sign up here" }).click();

    // Assert that the page's URL has changed to the sign-up page.
    await expect(page).toHaveURL("http://localhost:4321/signup");
  });

  // Test 4: Check the "Forgot Password?" link.
  test("should navigate to the forgot password page", async ({ page }) => {
    // Find the link by its text and click it.
    await page.getByRole("link", { name: "Forgot Password?" }).click();

    // Assert that the page's URL has changed to the forgot password page.
    await expect(page).toHaveURL("http://localhost:4321/forgot");
  });

  // Test 5: Verify that the form requires both fields to be filled before submission.
  test("should prevent form submission with empty fields", async ({ page }) => {
    // The form uses the 'required' attribute on the inputs, so the browser
    // will prevent submission. We can check for this by trying to submit
    // and ensuring the URL does not change.

    // Do not fill in any fields.
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    // The URL should remain the same, as the form was not submitted.
    await expect(page).toHaveURL("http://localhost:4321/signin");

    // Optional: You could also check if the error element remains empty.
    const errorMessage = page.locator("#error");
    await expect(errorMessage).not.toBeVisible();
  });
});
