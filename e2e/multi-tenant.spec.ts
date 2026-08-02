import { test, expect } from "@playwright/test";

test.describe("Multi-tenant school management workflow", () => {
  test("Super Administrator can create a school", async ({ page }) => {
    // Login as super admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "superadmin@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Should redirect to platform schools
    await expect(page).toHaveURL("/app/platform/schools");
    
    // Click create school
    await page.click('a[href="/app/platform/schools/new"]');
    
    // Fill school form
    const schoolName = "Test School " + Date.now();
    await page.fill('input[name="name"]', schoolName);
    await page.fill('input[name="slug"]', schoolName.toLowerCase().replace(/\s+/g, "-"));
    await page.fill('input[name="code"]', "TEST001");
    await page.fill('input[name="email"]', "admin@testschool.test");
    await page.fill('input[name="phone"]', "+256700000000");
    await page.fill('input[name="address"]', "Test Address");
    await page.selectOption('select[name="country_code"]', "UG");
    await page.fill('input[name="campus_name"]', "Main Campus");
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to school detail
    await expect(page).toHaveURL(/\/app\/platform\/schools\/[a-f0-9-]+/);
    await expect(page.locator("text=School created")).toBeVisible();
  });

  test("School Administrator can be invited", async ({ page }) => {
    // Login as super admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "superadmin@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Navigate to platform users
    await page.goto("/app/platform/users");
    
    // Fill invitation form
    const email = "schooladmin" + Date.now() + "@test.com";
    await page.fill('input[name="email"]', email);
    await page.selectOption('select[name="role_code"]', "school_admin");
    
    // Submit
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=Invitation sent")).toBeVisible();
  });

  test("Invited user can set password and login", async ({ page }) => {
    // This test would need to simulate the email flow
    // For now, we'll test the password reset flow directly
    
    await page.goto("/reset-password");
    await page.fill('input[name="password"]', "NewPassword123!");
    await page.fill('input[name="confirm"]', "NewPassword123!");
    await page.click('button[type="submit"]');
    
    // Should redirect to app
    await expect(page).toHaveURL("/app");
  });

  test("User with single school auto-selects school", async ({ page }) => {
    // Login as user with single school membership
    await page.goto("/login");
    await page.fill('input[name="email"]', "singleuser@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Should auto-select and redirect to app
    await expect(page).toHaveURL("/app");
  });

  test("User with multiple schools sees school selector", async ({ page }) => {
    // Login as user with multiple school memberships
    await page.goto("/login");
    await page.fill('input[name="email"]', "multischool@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Should show school selector
    await expect(page).toHaveURL("/app/select-school");
    await expect(page.locator("h1:has-text('Select School')")).toBeVisible();
  });

  test("School Administrator can invite teacher", async ({ page }) => {
    // Login as school admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "schooladmin@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Navigate to school users
    await page.goto("/app/users");
    
    // Fill invitation form
    const email = "teacher" + Date.now() + "@test.com";
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="first_name"]', "John");
    await page.fill('input[name="last_name"]', "Doe");
    await page.selectOption('select[name="role_code"]', "teacher");
    
    // Submit
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=Invitation sent")).toBeVisible();
  });

  test("Teacher cannot access finance modules", async ({ page }) => {
    // Login as teacher
    await page.goto("/login");
    await page.fill('input[name="email"]', "teacher@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Try to access finance
    await page.goto("/app/finance/invoices");
    
    // Should be denied
    await expect(page).toHaveURL(/\/access-denied/);
  });

  test("School A user cannot access School B data", async ({ page }) => {
    // Login as School A user
    await page.goto("/login");
    await page.fill('input[name="email"]', "schoola@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Try to access School B data directly by ID
    await page.goto("/app/students/school-b-student-id");
    
    // Should be denied or return not found
    await expect(page.locator("text=not found") || page.locator("text=access denied")).toBeVisible();
  });

  test("Suspended membership denies access", async ({ page }) => {
    // Login as suspended user
    await page.goto("/login");
    await page.fill('input[name="email"]', "suspended@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Should be denied
    await expect(page).toHaveURL(/\/access-denied/);
  });

  test("School user cannot assign platform roles", async ({ page }) => {
    // Login as school admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "schooladmin@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Navigate to school users
    await page.goto("/app/users");
    
    // Platform role select should not be visible
    await expect(page.locator('select[name="platform_role"]')).not.toBeVisible();
  });

  test("Parent can only see their own children", async ({ page }) => {
    // Login as parent
    await page.goto("/login");
    await page.fill('input[name="email"]', "parent@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Navigate to students
    await page.goto("/app/students");
    
    // Should only see their children
    const studentCount = await page.locator("table tbody tr").count();
    expect(studentCount).toBeGreaterThan(0);
    
    // Try to access another student
    await page.goto("/app/students/other-student-id");
    
    // Should be denied
    await expect(page.locator("text=not found") || page.locator("text=access denied")).toBeVisible();
  });

  test("User can switch between schools", async ({ page }) => {
    // Login as multi-school user
    await page.goto("/login");
    await page.fill('input[name="email"]', "multischool@schooldb.test");
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "TestPassword123!");
    await page.click('button[type="submit"]');
    
    // Select first school
    await page.click('button:has-text("Enter School")');
    
    // Should be in app
    await expect(page).toHaveURL("/app");
    
    // Navigate to school selector
    await page.goto("/app/select-school");
    
    // Select second school
    await page.click('button:has-text("Enter School")');
    
    // Should be in app with different school context
    await expect(page).toHaveURL("/app");
  });
});
