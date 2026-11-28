import { expect, Locator, Page } from '@playwright/test';

import { Account } from './accounts';
import { mailLog } from './mail';

/**
 * Clicks `button` until `dialog` opens. A click that lands while the page is still loading its data
 * does nothing, the way it would for a person clicking too early.
 */
export const openDialog = async (button: Locator, dialog: Locator): Promise<void> => {
  await expect(async () => {
    await button.click();
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
};

/** Creates a course from the courses page and returns its id. */
export const createCourse = async (instructorPage: Page, title: string): Promise<number> => {
  await instructorPage.goto('/courses');
  const dialog = instructorPage.getByRole('dialog');
  await openDialog(instructorPage.getByRole('button', { name: 'New Course' }), dialog);

  // Labelled "Give it an awesome name".
  await dialog.getByRole('textbox').first().fill(title);
  await dialog.getByRole('button', { name: 'Submit' }).click();

  await instructorPage.waitForURL(/\/courses\/\d+/);
  return Number(instructorPage.url().match(/\/courses\/(\d+)/)![1]);
};

/**
 * Invites `account` to the course as a student from the course's user invitations, and returns the
 * sign-up link from the invitation email.
 */
export const inviteToCourse = async (
  instructorPage: Page,
  courseId: number,
  account: Account,
): Promise<string> => {
  await instructorPage.goto(`/courses/${courseId}/users/invite`);
  await instructorPage.locator('#name-0').fill(account.name);
  await instructorPage.locator('#email-0').fill(account.email);

  const since = await mailLog.mark();
  await instructorPage.getByRole('button', { name: 'Invite All Users' }).click();
  await expect(instructorPage.getByRole('dialog')).toBeVisible();

  return mailLog.waitForLink(since, account.email, /^\/users\/sign_up\?invitation=/);
};
