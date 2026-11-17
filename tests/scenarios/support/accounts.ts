import { Browser, BrowserContext, expect, Page } from '@playwright/test';

import { devServer, getAdminCredentials } from './env';
import { mailLog } from './mail';

export interface Account {
  name: string;
  email: string;
  password: string;
}

type InstanceRole = 'normal' | 'instructor' | 'administrator';

const PASSWORD = 'scenario-password';

/**
 * A new address for each run. The development database keeps every account a scenario creates;
 * the `scenario-` prefix makes them easy to find.
 */
export const newAccount = (label: string): Account => {
  const stamp = Date.now();
  return {
    name: `Scenario ${label} ${stamp}`,
    email: `scenario-${label}-${stamp}@example.org`,
    password: PASSWORD,
  };
};

/**
 * Fills in the Keycloak sign-in page if the app redirected there, and returns once the app has
 * loaded signed in. A Keycloak session that is still valid skips the page.
 */
const completeSignIn = async (
  page: Page,
  { email, password }: Pick<Account, 'email' | 'password'>,
): Promise<void> => {
  const emailField = page.getByPlaceholder('Email');
  const userMenu = page.getByTestId('user-menu-button');

  await expect(emailField.or(userMenu)).toBeVisible({ timeout: 30_000 });
  if (await emailField.isVisible()) {
    await emailField.fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }
  await expect(userMenu).toBeVisible({ timeout: 30_000 });
};

/** Signs in through the Keycloak page, the way a person does. */
export const signIn = async (page: Page, account: Pick<Account, 'email' | 'password'>) => {
  // Without `next`, Keycloak is asked to return to the client's configured `OIDC_REDIRECT_URI`,
  // which needn't match the origin the client is served from (e.g. `localhost` vs `lvh.me`).
  // With it, Keycloak returns to this page's origin.
  await page.goto('/users/sign_in?next=/');
  await completeSignIn(page, account);
};

/**
 * Opens a separate browser context signed in as `account`, so that several people can act in one
 * scenario, each with their own session.
 */
export const openAs = async (
  browser: Browser,
  account: Pick<Account, 'email' | 'password'>,
): Promise<{ context: BrowserContext; page: Page }> => {
  const context = await browser.newContext({
    baseURL: devServer.baseURL,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  await signIn(page, account);
  return { context, page };
};

export const openAsAdmin = (browser: Browser) => openAs(browser, getAdminCredentials());

/**
 * Invites `account` to the instance from the instance administration page and returns the
 * sign-up link from the invitation email.
 */
export const inviteToInstance = async (
  adminPage: Page,
  account: Account,
  role: InstanceRole,
): Promise<string> => {
  await adminPage.goto('/admin/instance/users/invite');
  await adminPage.locator('#name-0').fill(account.name);
  await adminPage.locator('#email-0').fill(account.email);
  if (role !== 'normal') {
    await adminPage.locator('#select').first().click();
    await adminPage.locator(`#select-${role}`).click();
  }

  const since = await mailLog.mark();
  await adminPage.getByRole('button', { name: 'Invite All Users' }).click();

  return mailLog.waitForLink(since, account.email, /^\/users\/sign_up\?invitation=/);
};

/**
 * Completes sign-up from an invitation link. Invitations confirm the address, so no confirmation
 * email is needed. The app then sends the new user to sign in.
 */
export const signUpFromInvitation = async (
  page: Page,
  invitationLink: string,
  account: Account,
): Promise<void> => {
  await page.goto(invitationLink);
  await expect(page.getByLabel('Email address')).toHaveValue(account.email);
  await page.getByLabel('Password *', { exact: true }).fill(account.password);
  await page.getByLabel('Confirm password').fill(account.password);
  await page.frameLocator('[title="reCAPTCHA"]').getByLabel("I'm not a robot").click();

  const signedUp = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/users',
  );
  await page.getByRole('button', { name: 'Sign up' }).click();
  expect((await signedUp).ok()).toBe(true);

  // The app now redirects to Keycloak itself, but to the configured `OIDC_REDIRECT_URI` (see
  // `signIn`), so sign in from this origin instead.
  await signIn(page, account);
};

/** Signs `account` up from an invitation link in a new browser context of its own. */
export const signUpInNewContext = async (
  browser: Browser,
  invitationLink: string,
  account: Account,
): Promise<{ account: Account; context: BrowserContext; page: Page }> => {
  const context = await browser.newContext({
    baseURL: devServer.baseURL,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  await signUpFromInvitation(page, invitationLink, account);

  return { account, context, page };
};

/** Creates an account through an instance invitation sent by the administrator. */
export const createAccount = async (
  browser: Browser,
  adminPage: Page,
  label: string,
  role: InstanceRole,
): Promise<{ account: Account; context: BrowserContext; page: Page }> => {
  const account = newAccount(label);
  const link = await inviteToInstance(adminPage, account, role);
  return signUpInNewContext(browser, link, account);
};
