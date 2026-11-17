import { expect, Locator, Page } from '@playwright/test';

import { openNewQuestionForm } from './assessment';

/**
 * Replaces the content of an Ace editor. `insertText` enters the text in one input event, the way a
 * paste does, so Ace's auto-indent and bracket pairing don't alter it.
 */
export const fillAceEditor = async (page: Page, editor: Locator, code: string): Promise<void> => {
  await editor.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
};

export interface TestCase {
  expression: string;
  expected: string;
}

export interface ProgrammingQuestionSettings {
  title: string;
  maximumGrade: number;
  language: RegExp;
  attemptLimit?: number;
  template: string;
  publicTestCases: TestCase[];
}

/** Creates a programming question that is edited online, with public test cases. */
export const createProgrammingQuestion = async (
  instructorPage: Page,
  courseId: number,
  assessmentId: number,
  settings: ProgrammingQuestionSettings,
): Promise<void> => {
  const page = instructorPage;
  await openNewQuestionForm(page, courseId, assessmentId, 'Programming');

  await page.getByRole('textbox', { name: 'Title' }).fill(settings.title);
  await page.getByRole('textbox', { name: 'Maximum grade' }).fill(String(settings.maximumGrade));

  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: settings.language }).first().click();
  await page.getByRole('checkbox', { name: 'Evaluate and test code' }).check();
  if (settings.attemptLimit !== undefined) {
    await page.getByRole('textbox', { name: 'Attempt limit' }).fill(String(settings.attemptLimit));
  }

  // The editors are, in order: template, solution, prepend and append.
  await fillAceEditor(page, page.locator('.ace_editor').first(), settings.template);

  const publicSection = page
    .getByRole('button', { name: 'Public test cases' })
    .locator('xpath=ancestor::*[.//button[@aria-label="Add a test case"]][1]');
  for (const [index, testCase] of settings.publicTestCases.entries()) {
    await publicSection.getByRole('button', { name: 'Add a test case' }).click();
    await publicSection.getByRole('textbox', { name: 'Expression' }).nth(index).fill(testCase.expression);
    await publicSection.getByRole('textbox', { name: 'Expected' }).nth(index).fill(testCase.expected);
  }

  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.waitForURL(new RegExp(`/assessments/${assessmentId}$`), { timeout: 60_000 });
};

/** Creates a text response question with no solutions, so grading always gives it full marks. */
export const createTextResponseQuestion = async (
  instructorPage: Page,
  courseId: number,
  assessmentId: number,
  settings: { title: string; maximumGrade: number },
): Promise<void> => {
  const page = instructorPage;
  await openNewQuestionForm(page, courseId, assessmentId, 'Text Response');

  await page.getByRole('textbox', { name: 'Title' }).fill(settings.title);
  await page.getByRole('textbox', { name: 'Maximum grade' }).fill(String(settings.maximumGrade));

  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.waitForURL(new RegExp(`/assessments/${assessmentId}$`), { timeout: 60_000 });
  await expect(page.getByText(settings.title)).toBeVisible();
};
