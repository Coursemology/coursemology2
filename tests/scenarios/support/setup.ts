import { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';

import {
  Account,
  createAccount,
  newAccount,
  openAsAdmin,
  signUpInNewContext,
} from './accounts';
import { createAssessment, publishAssessment } from './assessment';
import { createCourse, inviteToCourse } from './course';
import { createProgrammingQuestion, createTextResponseQuestion } from './questions';

interface Person {
  account: Account;
  context: BrowserContext;
  page: Page;
}

export interface ScenarioSetup {
  instructor: Person;
  student: Person;
  courseId: number;
  assessmentId: number;
}

/** Q1's code at each version the scenarios type; each ends in a marker comment (see snapshot.ts). */
export const code = (body: string, version: string): string =>
  `def add(a, b):\n    ${body}  # ${version}\n`;

/**
 * Sets up the scenarios' assessment through the UI: an instructor invited by the administrator, a
 * course, a published assessment with a programming question (Q1) and a text response question (Q2),
 * and a student invited to the course.
 */
export const setUpAssessment = async (
  browser: Browser,
  testInfo: TestInfo,
  settings: { title: string; autograded: boolean; delayedGradePublication?: boolean },
): Promise<ScenarioSetup> => {
  const admin = await openAsAdmin(browser);
  const instructor = await createAccount(browser, admin.page, 'instructor', 'instructor');
  await admin.context.close();

  const courseId = await createCourse(instructor.page, `${settings.title} ${Date.now()}`);
  const assessmentId = await createAssessment(instructor.page, courseId, settings);
  await createProgrammingQuestion(instructor.page, courseId, assessmentId, {
    title: 'Q1 add',
    maximumGrade: 10,
    language: /^Python 3\.14$/,
    attemptLimit: 5,
    template: code('return 0', 'T'),
    publicTestCases: [
      { expression: 'add(1, 2)', expected: '3' },
      { expression: 'add(5, 0)', expected: '5' },
    ],
  });
  await createTextResponseQuestion(instructor.page, courseId, assessmentId, {
    title: 'Q2 text',
    maximumGrade: 10,
  });
  await publishAssessment(instructor.page, courseId, assessmentId);

  const studentAccount = newAccount('student');
  const link = await inviteToCourse(instructor.page, courseId, studentAccount);
  const student = await signUpInNewContext(browser, link, studentAccount);

  await testInfo.attach('setup.json', {
    body: JSON.stringify(
      { instructor: instructor.account, student: student.account, courseId, assessmentId },
      null,
      2,
    ),
    contentType: 'application/json',
  });
  return { instructor, student, courseId, assessmentId };
};
