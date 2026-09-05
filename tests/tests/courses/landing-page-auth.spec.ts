import { test, expect, manufacture } from 'helpers';

import type { Page } from '@playwright/test';

/**
 * Regression cover for a returning signed-in user opening a course landing page.
 *
 * The stored access token expires (realm `accessTokenLifespan`, 900s) long
 * before the Keycloak SSO session does (`ssoSessionMaxLifespanRememberMe`, 7
 * days), so such a user boots with `isAuthenticated` false. Two defects met
 * there:
 *
 *   1. nothing recovered the session. oidc-client-ts only schedules a renewal
 *      for a token that is still live, so an already-expired one left the user
 *      on `UnauthenticatedApp` indefinitely; and
 *   2. `Course::CoursesController#show` is `publicly_accessible?`, so it skipped
 *      `authenticate!` and never refreshed the `access_token` cookie. That
 *      cookie is the only credential an `<img>` can carry, so description images
 *      401'd against a stale JWT.
 *
 * The last test covers the case where the upstream session really is gone, and
 * being treated as an anonymous visitor is the correct outcome.
 */

const ATTACHMENT_COOKIE = 'access_token';

const anHourAgo = (): number => Math.floor(Date.now() / 1000) - 3600;

const updateStoredUser = (
  page: Page,
  patch: Record<string, unknown>,
): Promise<void> =>
  page.evaluate((changes) => {
    const key = Object.keys(localStorage).find((k) =>
      k.startsWith('oidc.user:'),
    );
    if (!key) throw new Error('No stored OIDC user; was the page signed in?');

    const user = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...user, ...changes }));
  }, patch);

/** Makes the stored OIDC access token look expired without touching Keycloak. */
const expireStoredAccessToken = (page: Page): Promise<void> =>
  updateStoredUser(page, { expires_at: anHourAgo() });

/**
 * Records the status of every response for the given attachment, so we can
 * assert on the network rather than on whether the image happened to paint.
 */
const watchAttachmentResponses = (page: Page, id: string): number[] => {
  const statuses: number[] = [];
  page.on('response', (response) => {
    if (response.url().includes(`/attachments/${id}`))
      statuses.push(response.status());
  });
  return statuses;
};

const expectAttachmentToLoad = async (statuses: number[]): Promise<void> => {
  await expect
    .poll(() => statuses.length, {
      message: 'expected the course description image to be requested',
    })
    .toBeGreaterThan(0);

  expect(statuses).not.toContain(401);
};

test.describe('course landing page for a returning authenticated user', () => {
  let course: { id: number };
  let attachmentId: string;

  test.beforeEach(async () => {
    // The factory's default fixture is a text file. That is fine: the browser
    // still issues the GET for an `<img>` regardless of content type, and we
    // assert on the response status, not on the rendered pixels.
    const attachment = await manufacture({ attachment_reference: {} });
    attachmentId = attachment.id;

    course = await manufacture({
      course: {
        traits: ['published'],
        description: `<p>Welcome</p><img src="/attachments/${attachmentId}">`,
      },
    });
  });

  test('serves the authenticated page when only the stored token is stale', async ({
    authedPage: page,
  }) => {
    await page.goto(`/courses/${course.id}`);
    await expireStoredAccessToken(page);

    const statuses = watchAttachmentResponses(page, attachmentId);
    await page.reload();

    // The refresh token is still valid, so the user is still signed in and must
    // stay on their course page. Today the expired bearer 401s the course load,
    // which exhausts Base.ts's retries and hands the whole page to
    // `signinRedirect`, navigating away to Keycloak.
    await expect(page).toHaveURL(new RegExp(`/courses/${course.id}`));

    // The cookie has not lapsed, but it carries the *same* expired JWT, and the
    // backend verifies its `exp`. So this fails until the cookie's token is kept
    // fresh, not merely until the router is fixed.
    await expectAttachmentToLoad(statuses);
  });

  test('loads description images when only the cookie has lapsed', async ({
    authedPage: page,
  }) => {
    await page.goto(`/courses/${course.id}`);
    await page.context().clearCookies({ name: ATTACHMENT_COOKIE });

    const statuses = watchAttachmentResponses(page, attachmentId);
    await page.reload();

    // This one already passes: `CourseShow` gates the description behind its
    // `isLoading` check, so the bearer-carrying course fetch (which re-mints the
    // cookie with a fresh JWT) always completes before the `<img>` can mount.
    // Kept as a regression guard on that ordering.
    await expect(page.getUserMenuButton()).toBeVisible();
    await expectAttachmentToLoad(statuses);
  });

  test('loads description images on a cold return visit', async ({
    authedPage: page,
  }) => {
    await page.goto(`/courses/${course.id}`);

    // Both bits at once: the reported bug.
    await expireStoredAccessToken(page);
    await page.context().clearCookies({ name: ATTACHMENT_COOKIE });

    const statuses = watchAttachmentResponses(page, attachmentId);
    await page.reload();

    await expect(page).toHaveURL(new RegExp(`/courses/${course.id}`));
    await expectAttachmentToLoad(statuses);
  });

  test('falls through to the public page when the upstream session is gone', async ({
    authedPage: page,
  }) => {
    await page.goto(`/courses/${course.id}`);

    // Two halves, both needed. Corrupting the refresh token is what makes
    // `signinSilent` fail rather than quietly succeeding; clearing cookies is
    // what removes Keycloak's own SSO session, without which it would just
    // re-issue a token and never fail at all.
    await updateStoredUser(page, {
      expires_at: anHourAgo(),
      refresh_token: 'no-longer-redeemable',
    });
    await page.context().clearCookies();

    await page.reload();

    // The session is unrecoverable, so recovery gives up and the visitor is
    // treated as anonymous on a published course: they stay where they are and
    // get a Sign in button, rather than being bounced to a login screen.
    await expect(page).toHaveURL(new RegExp(`/courses/${course.id}`));
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});

test.describe('signing in from a publicly accessible course page', () => {
  let course: { id: number };

  test.beforeEach(async () => {
    course = await manufacture({ course: { traits: ['published'] } });
  });

  test('returns the user to the course they were viewing', async ({
    signInPage: page,
  }) => {
    const user = await page.manufactureUser();

    await page.goto(`/courses/${course.id}`);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL(/localhost:8443/, { timeout: 30_000 });
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Not the origin, which would bounce them on to whichever course they
    // happened to open last.
    await expect(page).toHaveURL(new RegExp(`/courses/${course.id}`), {
      timeout: 30_000,
    });
  });
});
