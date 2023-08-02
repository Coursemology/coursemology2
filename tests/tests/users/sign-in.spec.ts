import { test, expect } from 'helpers';

test('can sign in', async ({ signInPage: page }) => {
  const { email, password } = await page.manufactureUser();

  await page.getEmailField().fill(email);
  await page.getPasswordField().fill(password);
  await page.getSignInButton().click();

  await expect(page.getUserMenuButton()).toBeVisible();
});
