import { expect, Page } from '@playwright/test';

import { openDialog } from './course';

export interface AssessmentSettings {
  title: string;
  autograded: boolean;
  delayedGradePublication?: boolean;
}

/**
 * Fills an MUI date-time field (format `DD-MM-YYYY HH:mm`) by typing into its sections, as a person
 * does with the keyboard.
 */
const fillDateTime = async (page: Page, label: string, date: Date): Promise<void> => {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const digits =
    pad(date.getDate()) +
    pad(date.getMonth() + 1) +
    date.getFullYear() +
    pad(date.getHours()) +
    pad(date.getMinutes());

  const field = page.getByRole('textbox', { name: label });
  await field.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(digits);
};

/** Creates a published assessment in the course's default tab and returns its id. */
export const createAssessment = async (
  instructorPage: Page,
  courseId: number,
  settings: AssessmentSettings,
): Promise<number> => {
  const page = instructorPage;
  await page.goto(`/courses/${courseId}/assessments`);
  const dialog = page.getByRole('dialog');
  await openDialog(page.getByRole('button', { name: 'New Assessment' }), dialog);

  await dialog.getByRole('textbox', { name: 'Title' }).fill(settings.title);
  await fillDateTime(page, 'Starts at', new Date(Date.now() - 24 * 60 * 60 * 1000));

  await dialog.getByRole('radio', { name: settings.autograded ? /^Autograded/ : /^Manual/ }).check();
  // The scenarios' test cases are public, and public ones don't count towards the grade by default.
  await dialog.getByRole('checkbox', { name: 'Public test cases' }).check();
  if (settings.delayedGradePublication) {
    await dialog.getByRole('checkbox', { name: 'Enable delayed grade publication' }).check();
  }

  // New assessments are always created as drafts; see `publishAssessment`.
  await dialog.getByRole('button', { name: 'Create As Draft' }).click();
  await page.waitForURL(/\/assessments\/\d+$/);
  return Number(page.url().match(/\/assessments\/(\d+)$/)![1]);
};

/** Publishes the assessment from its edit page. */
export const publishAssessment = async (
  instructorPage: Page,
  courseId: number,
  assessmentId: number,
): Promise<void> => {
  const page = instructorPage;
  await page.goto(`/courses/${courseId}/assessments/${assessmentId}/edit`);
  await page.getByRole('radio', { name: /^Published/ }).check();

  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      new URL(response.url()).pathname === `/courses/${courseId}/assessments/${assessmentId}`,
  );
  await page.getByRole('button', { name: 'Save' }).click();
  expect((await saved).ok()).toBe(true);
};

/**
 * Opens the form for a new question of `type` (as labelled in the New Question menu). The menu opens
 * forms in a new tab; this follows the same link in the current tab instead.
 */
export const openNewQuestionForm = async (
  instructorPage: Page,
  courseId: number,
  assessmentId: number,
  type: 'Programming' | 'Text Response',
): Promise<void> => {
  const page = instructorPage;
  await page.goto(`/courses/${courseId}/assessments/${assessmentId}`);
  await page.getByRole('button', { name: 'New Question' }).click();

  const link = page.getByRole('link').filter({ has: page.getByRole('menuitem', { name: type }) });
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();
  await page.keyboard.press('Escape');
  await page.goto(href!);
};
