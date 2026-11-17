import { expect, Locator, Page, Response } from '@playwright/test';

import { fillAceEditor } from './questions';

const isAnswerSave = (response: Response): boolean =>
  response.request().method() === 'PATCH' &&
  /\/submissions\/\d+\/answers\/\d+$/.test(new URL(response.url()).pathname);

const isSubmitAnswer = (response: Response): boolean =>
  /\/answers\/\d+\/submit_answer$/.test(new URL(response.url()).pathname);

const isSubmissionUpdate = (submissionId: number) => (response: Response): boolean =>
  response.request().method() === 'PATCH' &&
  new URL(response.url()).pathname.endsWith(`/submissions/${submissionId}`);

/**
 * The block of the submission page that shows the question titled `title`: the innermost element
 * holding both its title and its comments, which come last in each question.
 */
export const questionSection = (page: Page, title: string): Locator =>
  page
    .locator('div')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    .filter({ has: page.getByRole('heading', { name: 'Comments', exact: true }) })
    .last();

/** Starts an attempt from the assessment page and returns the submission's id. */
export const attempt = async (
  studentPage: Page,
  courseId: number,
  assessmentId: number,
): Promise<number> => {
  await studentPage.goto(`/courses/${courseId}/assessments/${assessmentId}`);
  await studentPage.getByRole('button', { name: 'Attempt' }).click();
  await studentPage.waitForURL(/\/submissions\/\d+\/edit/);
  await expect(studentPage.locator('.ace_editor').first()).toBeVisible();
  return Number(studentPage.url().match(/\/submissions\/(\d+)\/edit/)![1]);
};

export const openSubmission = async (
  page: Page,
  courseId: number,
  assessmentId: number,
  submissionId: number,
): Promise<void> => {
  await page.goto(`/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`);
  // Students see "Past Answers"; graders see "All Answers".
  await expect(page.getByRole('button', { name: /^(Past|All) Answers/ }).first()).toBeVisible();
};

/** Types code into a programming question's editor and waits for the autosave that follows. */
export const typeCode = async (page: Page, questionTitle: string, code: string): Promise<void> => {
  const saved = page.waitForResponse(isAnswerSave, { timeout: 20_000 });
  await fillAceEditor(page, questionSection(page, questionTitle).locator('.ace_editor').first(), code);
  expect((await saved).ok()).toBe(true);
};

/** Types into a text response question's answer and waits for the autosave that follows. */
export const typeText = async (page: Page, questionTitle: string, text: string): Promise<void> => {
  const saved = page.waitForResponse(isAnswerSave, { timeout: 20_000 });
  const editor = questionSection(page, questionTitle).getByRole('textbox', { name: /^Rich Text Editor/ }).first();
  await editor.click();
  await page.keyboard.insertText(text);
  expect((await saved).ok()).toBe(true);
};

/**
 * A question's Check Answer button. Its accessible name is its tooltip, "(Ctrl+Enter) or (⌘+Enter)",
 * so it's found by its text, which also shows the attempts left.
 */
const checkAnswerButton = (page: Page, questionTitle: string): Locator =>
  questionSection(page, questionTitle).getByRole('button').filter({ hasText: /^Check Answer/ });

/** Clicks Check Answer on a question and waits for the request; grading continues in a job. */
export const checkAnswer = async (page: Page, questionTitle: string): Promise<void> => {
  const button = checkAnswerButton(page, questionTitle);
  const submitted = page.waitForResponse(isSubmitAnswer);
  await button.click();
  expect((await submitted).ok()).toBe(true);
};

/** The attempts left that a question's Check Answer button shows, or null without a limit. */
export const attemptsLeftShown = async (page: Page, questionTitle: string): Promise<number | null> => {
  const label = await checkAnswerButton(page, questionTitle).textContent({ timeout: 5_000 });
  const match = label?.match(/\((\d+) attempts? left\)/);
  return match ? Number(match[1]) : null;
};

/** Confirms the dialog a submission button opens, if it opens one: Submit for Publishing doesn't. */
const confirmIfAsked = async (page: Page): Promise<void> => {
  const dialog = page.getByRole('dialog');
  const asked = await dialog
    .waitFor({ state: 'visible', timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
  if (asked) await dialog.getByRole('button').last().click();
};

/** Clicks a submission-level button, confirms it, and waits for the submission update. */
const updateSubmission = async (
  page: Page,
  submissionId: number,
  buttonName: string,
  isRequest: (response: Response) => boolean = isSubmissionUpdate(submissionId),
): Promise<Response> => {
  const updated = page.waitForResponse(isRequest, { timeout: 30_000 });
  await page.getByRole('button', { name: buttonName, exact: true }).click();
  await confirmIfAsked(page);
  const response = await updated;
  expect(response.ok(), `${buttonName}: ${response.status()} ${await response.text()}`).toBe(true);
  return response;
};

export const finalise = (page: Page, submissionId: number): Promise<Response> =>
  updateSubmission(page, submissionId, 'Finalise all answers');

export const submitForPublishing = (page: Page, submissionId: number): Promise<Response> =>
  updateSubmission(page, submissionId, 'Submit for Publishing');

export const publishGrade = (page: Page, submissionId: number): Promise<Response> =>
  updateSubmission(page, submissionId, 'Publish Grade');

export const unsubmit = (page: Page, submissionId: number): Promise<Response> =>
  updateSubmission(page, submissionId, 'Unsubmit Submission', (response) =>
    new URL(response.url()).pathname.endsWith('/submissions/unsubmit'),
  );

/**
 * Unsubmits from the assessment's submissions list. The grading page offers Unsubmit Submission only
 * for submitted and published submissions; for a graded one, the list's row button is the way. Both
 * send the same request.
 */
export const unsubmitFromList = async (
  page: Page,
  courseId: number,
  assessmentId: number,
  studentName: string,
): Promise<Response> => {
  await page.goto(`/courses/${courseId}/assessments/${assessmentId}/submissions`);
  const button = page
    .getByRole('row')
    .filter({ hasText: studentName })
    .locator('[id^="unsubmit-button-"]');
  await expect(button).toBeEnabled();

  const updated = page.waitForResponse(
    (response) => new URL(response.url()).pathname.endsWith('/submissions/unsubmit'),
    { timeout: 30_000 },
  );
  await button.click();
  await confirmIfAsked(page);
  const response = await updated;
  expect(response.ok(), `unsubmit: ${response.status()} ${await response.text()}`).toBe(true);
  return response;
};

/** Grader's Evaluate Answers: grades every current answer again. */
export const evaluateAnswers = async (page: Page): Promise<void> => {
  const requested = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/auto_grade'));
  await page.getByRole('button', { name: 'Evaluate Answers', exact: true }).click();
  expect((await requested).ok()).toBe(true);
};

/**
 * Enters a grade for a question on the grading page. The grade field has no label; it's the only
 * text input in the question's block (the code and comment editors aren't inputs).
 */
export const enterGrade = async (page: Page, questionTitle: string, grade: number): Promise<void> => {
  const field = questionSection(page, questionTitle)
    .locator('input[type="text"], input[type="number"], input:not([type])')
    .first();
  await field.fill(String(grade));
};
