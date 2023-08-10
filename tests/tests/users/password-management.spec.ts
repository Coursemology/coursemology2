import { expect, test } from '../../helpers';

test('can change password', async ({ authedPage: page }) => {
  const newPassword = 'newpassword';

  await page.goto('/user/profile/edit');

  await page.getByLabel('Current password').fill(page.user.password);
  await page.getByLabel('New password', { exact: true }).fill(newPassword);
  await page.getByLabel('Confirm new password').fill(newPassword);

  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Your changes have been saved')).toBeVisible();

  await page.signOut();

  await page.getByLabel('Email address').fill(page.user.email);
  await page.getByLabel('Password').fill(page.user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('invalid email or password')).toBeVisible();

  await page.getByLabel('Password').fill(newPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getUserMenuButton()).toBeVisible();
});
