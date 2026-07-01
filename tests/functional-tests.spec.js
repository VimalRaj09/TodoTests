import { test, expect } from '@playwright/test';

// ============= POSITIVE TEST 1: User Registration =============
test('✅ POSITIVE 1: User can register successfully', async ({ page }) => {
  const username = `testuser_${Date.now()}`;
  const password = 'TestPass123!';
  const email = `${username}@example.com`;

  await page.goto('/');

  // Click register tab
  await page.click('[data-testid="register-tab"]');

  // Fill registration form
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="password-input"]', password);

  // Submit
  await page.click('[data-testid="submit-button"]');

  // Verify redirected to todo page
  await page.waitForSelector('[data-testid="task-input"]', { timeout: 5000 });

  // Verify username is shown
  const userDisplay = page.locator('span').filter({ hasText: username });
  await expect(userDisplay).toBeVisible();
});

// ============= POSITIVE TEST 2: User Can Create Task =============
test('✅ POSITIVE 2: User can create a new task', async ({ page }) => {
  const username = `testuser_${Date.now()}`;
  const password = 'TestPass123!';
  const email = `${username}@example.com`;

  // 1. Register
  await page.goto('/');
  await page.click('[data-testid="register-tab"]');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="submit-button"]');
  await page.waitForSelector('[data-testid="task-input"]');

  // 2. Create task
  const taskTitle = `Important Task ${Date.now()}`;
  await page.fill('[data-testid="task-input"]', taskTitle);
  await page.selectOption('[data-testid="priority-select"]', 'high');
  await page.click('[data-testid="add-task-button"]');

  // 3. Verify task appears
  await page.waitForSelector('[data-testid^="task-"]');
  const taskElement = page.locator('span').filter({ hasText: taskTitle });
  await expect(taskElement).toBeVisible();
});

// ============= POSITIVE TEST 3: Mark Task as Done, Assert, then Delete =============
test('✅ POSITIVE 3: User can mark task as done, verify completion, then delete', async ({ page }) => {
  const username = `testuser_${Date.now()}`;
  const password = 'TestPass123!';
  const email = `${username}@example.com`;

  // 1. Register
  await page.goto('/');
  await page.click('[data-testid="register-tab"]');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="submit-button"]');
  await page.waitForSelector('[data-testid="task-input"]');

  // 2. Create task
  const taskTitle = `Task to Complete ${Date.now()}`;
  await page.fill('[data-testid="task-input"]', taskTitle);
  await page.selectOption('[data-testid="priority-select"]', 'high');
  await page.click('[data-testid="add-task-button"]');
  
  // Wait for the specific task we created to appear by its title
  await page.waitForSelector('text=' + taskTitle);
  
  // Find the task item container by searching for our created task title
  const taskTitleElement = page.locator('span').filter({ hasText: taskTitle }).first();
  const taskItem = taskTitleElement.locator('xpath=ancestor::div[@data-testid]');
  
  // Extract the task ID from the parent div's data-testid
  const taskTestId = await taskItem.getAttribute('data-testid');
  const taskId = taskTestId.replace('task-', '');
  console.log(`Created task ID: ${taskId}`);

  // 3. Get checkbox using the exact task ID
  const checkbox = page.getByTestId(`task-checkbox-${taskId}`);
  console.log(`Checkbox selector: task-checkbox-${taskId}`);
  
  // Verify checkbox is visible before interacting
  await expect(checkbox).toBeVisible();
  
  // 4. MARK TASK AS DONE - Use click() instead of check() for React controlled component
  await checkbox.click();
  await page.waitForTimeout(500);

  // 5. VERIFY TASK IS MARKED AS DONE
  // Assert: Checkbox should now be checked
  await expect(checkbox).toBeChecked();

  // Assert: Task item should have "completed" class
  await expect(taskItem).toHaveClass(/completed/);

  // 6. DELETE THE COMPLETED TASK
  const deleteButton = page.getByTestId(`delete-task-${taskId}`);
  await deleteButton.click();
  await page.waitForTimeout(500);

  // 7. VERIFY TASK IS DELETED
  await expect(taskTitleElement).not.toBeVisible();
});

// ============= NEGATIVE TEST 4: Invalid Login Rejection =============
test('❌ NEGATIVE 4: Login fails with invalid credentials', async ({ page }) => {
  await page.goto('/');

  // Try to login with non-existent account
  await page.fill('[data-testid="username-input"]', 'nonexistent_user_12345');
  await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
  await page.click('[data-testid="submit-button"]');

  // Verify error message appears
  const errorMessage = page.locator('[data-testid="error-message"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Invalid credentials');

  // Verify still on login page
  await expect(page.locator('[data-testid="login-tab"]')).toBeVisible();
});

// ============= NEGATIVE TEST 5: Form Validation Fails =============
test('❌ NEGATIVE 5: Form validation rejects empty fields', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="register-tab"]');

  // Try to submit empty form
  await page.click('[data-testid="submit-button"]');

  // Wait a moment for validation
  await page.waitForTimeout(1000);

  // Verify still on registration page (didn't redirect)
  await expect(page.locator('[data-testid="register-tab"]')).toBeVisible();

  // Verify not redirected to tasks
  const taskInput = page.locator('[data-testid="task-input"]');
  await expect(taskInput).not.toBeVisible();
});
