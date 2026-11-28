import { test } from 'helpers';

import { code, setUpAssessment } from './support/setup';
import { StepRecorder } from './support/steps';
import {
  attempt,
  checkAnswer,
  enterGrade,
  evaluateAnswers,
  finalise,
  openSubmission,
  submitForPublishing,
  typeCode,
  typeText,
  unsubmitFromList,
} from './support/submission';

/**
 * A manually graded assessment with delayed grade publication, where the grader submits grades for publishing
 * and then unsubmits the student.
 *
 * This used to end with stale test results (the November 2026 incident): unsubmitting a graded submission
 * unmarked it first, which queued its grading, and that job graded the new drafts. They were then evaluated
 * while the submission was attempting, and the resubmit kept them with their old results. The predictions from
 * MD6 on are the fixed behaviour: the drafts stay attempting, and the resubmit grades the student's latest code.
 */

const V1 = code('return a - b', 'v1');
const V2 = code('return a + b', 'v2');
const V3 = code('return b + a', 'v3');
const V4 = code('return a * b', 'v4');

test('MD: manually graded, delayed publication, unsubmitted after grading', async ({ browser }, testInfo) => {
  const { instructor, student, courseId, assessmentId } = await test.step('setup', () =>
    setUpAssessment(browser, testInfo, {
      title: 'Scenario MD',
      autograded: false,
      delayedGradePublication: true,
    }),
  );

  let submissionId = 0;
  const steps = new StepRecorder(testInfo, 'MD', () => submissionId);
  const s = student.page;
  const g = instructor.page;
  const openAsGrader = (): Promise<void> => openSubmission(g, courseId, assessmentId, submissionId);
  const openAsStudent = (): Promise<void> => openSubmission(s, courseId, assessmentId, submissionId);

  await steps.step(
    'MD0',
    'Student clicks Attempt; the edit page loads',
    async () => {
      submissionId = await attempt(s, courseId, assessmentId);
    },
    {
      submission: 'attempting',
      answers: { Q1: ['a1★ attempting T'], Q2: ['a1★ attempting ""'] },
      attemptsLeft: 5,
    },
    { student: s },
  );

  await steps.step(
    'MD1',
    'Student types v1 and a Q2 answer; autosave',
    async () => {
      await typeCode(s, 'Q1 add', V1);
      await typeText(s, 'Q2 text', 'first answer');
    },
    {
      submission: 'attempting',
      answers: { Q1: ['a1★ attempting v1'], Q2: ['a1★ attempting "first answer"'] },
    },
    { student: s },
  );

  await steps.step(
    'MD2',
    'Check Answer on Q1',
    () => checkAnswer(s, 'Q1 add'),
    {
      submission: 'attempting',
      answers: {
        Q1: ['a1★ attempting v1', 'a2 evaluated v1 runs=[1/2]'],
        Q2: ['a1★ attempting "first answer"'],
      },
      attemptsLeft: 4,
    },
    { student: s },
  );

  await steps.step(
    'MD3',
    'Student types v2, Check Answer',
    async () => {
      await typeCode(s, 'Q1 add', V2);
      await checkAnswer(s, 'Q1 add');
    },
    {
      submission: 'attempting',
      answers: {
        Q1: ['a1★ attempting v2', 'a2 evaluated v1 runs=[1/2]', 'a3 evaluated v2 runs=[2/2]'],
        Q2: ['a1★ attempting "first answer"'],
      },
      attemptsLeft: 3,
    },
    { student: s },
  );

  await steps.step(
    'MD4',
    'Student types v3, then Finalise without Check Answer',
    async () => {
      await typeCode(s, 'Q1 add', V3);
      await finalise(s, submissionId);
    },
    {
      submission: 'submitted',
      answers: {
        Q1: ['a2 evaluated v1 runs=[1/2]', 'a3 evaluated v2 runs=[2/2]', 'a4★ evaluated v3 runs=[2/2]'],
        Q2: ['a1★ evaluated "first answer"'],
      },
    },
    { screenshot: s },
  );

  await steps.step(
    'MD5',
    'Grader enters grades (Q1 7, Q2 8) and clicks Submit for Publishing',
    async () => {
      await openAsGrader();
      await enterGrade(g, 'Q1 add', 7);
      await enterGrade(g, 'Q2 text', 8);
      await submitForPublishing(g, submissionId);
    },
    {
      submission: 'graded',
      answers: {
        Q1: [
          'a2 graded v1 runs=[1/2] grade=0',
          'a3 graded v2 runs=[2/2] grade=0',
          'a4★ graded v3 runs=[2/2] grade=7',
        ],
        Q2: ['a1★ graded "first answer" grade=8'],
      },
    },
    { screenshot: g },
  );

  await steps.step(
    'MD6',
    'Grader unsubmits from the submissions list',
    async () => {
      // A graded submission's grading page has no Unsubmit Submission button.
      await unsubmitFromList(g, courseId, assessmentId, student.account.name);
    },
    {
      submission: 'attempting',
      answers: {
        Q1: [
          'a2 evaluated v1 runs=[1/2] grade=0',
          'a3 evaluated v2 runs=[2/2] grade=0',
          'a4 evaluated v3 runs=[2/2] grade=7',
          // The unmark keeps the grades above. The new drafts stay ungraded.
          'a5★ attempting v3',
        ],
        Q2: ['a1 evaluated "first answer" grade=8', 'a2★ attempting "first answer"'],
      },
    },
    { screenshot: g },
  );

  await steps.step(
    'MD7',
    'Student opens the edit page and types v4; autosave',
    async () => {
      await openAsStudent();
      await typeCode(s, 'Q1 add', V4);
    },
    {
      submission: 'attempting',
      answers: {
        Q1: [
          'a2 evaluated v1 runs=[1/2] grade=0',
          'a3 evaluated v2 runs=[2/2] grade=0',
          'a4 evaluated v3 runs=[2/2] grade=7',
          'a5★ attempting v4',
        ],
        Q2: ['a1 evaluated "first answer" grade=8', 'a2★ attempting "first answer"'],
      },
      attemptsLeft: 2,
    },
    { student: s },
  );

  await steps.step(
    'MD8',
    'Check Answer on Q1',
    () => checkAnswer(s, 'Q1 add'),
    {
      submission: 'attempting',
      answers: {
        Q1: [
          'a2 evaluated v1 runs=[1/2] grade=0',
          'a3 evaluated v2 runs=[2/2] grade=0',
          'a4 evaluated v3 runs=[2/2] grade=7',
          'a5★ attempting v4',
          'a6 evaluated v4 runs=[0/2]',
        ],
        Q2: ['a1 evaluated "first answer" grade=8', 'a2★ attempting "first answer"'],
      },
      attemptsLeft: 1,
    },
    { student: s },
  );

  await steps.step(
    'MD9',
    'Student clicks Finalise',
    () => finalise(s, submissionId).then(() => undefined),
    {
      submission: 'submitted',
      answers: {
        // Both drafts match their latest past answers, which become current again; the drafts are removed.
        // Q2's answer comes back with the grade it was given before the unsubmit.
        Q1: [
          'a2 evaluated v1 runs=[1/2] grade=0',
          'a3 evaluated v2 runs=[2/2] grade=0',
          'a4 evaluated v3 runs=[2/2] grade=7',
          'a6★ evaluated v4 runs=[0/2]',
        ],
        Q2: ['a1★ evaluated "first answer" grade=8'],
      },
    },
    { screenshot: s },
  );

  await steps.step(
    'MD10',
    'Grader opens the grading page and clicks Evaluate Answers',
    async () => {
      await openAsGrader();
      const before = testInfo.outputPath('MD10-grading-page-before.png');
      await g.screenshot({ path: before, fullPage: true });
      await testInfo.attach('MD10 grading page before.png', { path: before, contentType: 'image/png' });
      await evaluateAnswers(g);
    },
    {
      submission: 'submitted',
      answers: {
        Q1: [
          'a2 evaluated v1 runs=[1/2] grade=0',
          'a3 evaluated v2 runs=[2/2] grade=0',
          'a4 evaluated v3 runs=[2/2] grade=7',
          'a6★ evaluated v4 runs=[0/2,0/2]',
        ],
        Q2: ['a1★ evaluated "first answer" grade=8'],
      },
    },
    { screenshot: g },
  );
});
