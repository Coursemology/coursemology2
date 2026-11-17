import { test } from 'helpers';

import { code, setUpAssessment } from './support/setup';
import { StepRecorder } from './support/steps';
import {
  attempt,
  checkAnswer,
  enterGrade,
  finalise,
  openSubmission,
  publishGrade,
  typeCode,
  typeText,
} from './support/submission';

/**
 * The plain path through a manually graded programming assessment. The student attempts, checks two versions,
 * and finalises; the grader grades and publishes.
 */

const V1 = code('return a - b', 'v1');
const V2 = code('return a + b', 'v2');

test('M: attempt, check, finalise, grade and publish', async ({ browser }, testInfo) => {
  const { instructor, student, courseId, assessmentId } = await test.step('setup', () =>
    setUpAssessment(browser, testInfo, { title: 'Scenario M', autograded: false }),
  );

  let submissionId = 0;
  const steps = new StepRecorder(testInfo, 'M', () => submissionId);
  const s = student.page;
  const g = instructor.page;

  await steps.step(
    'M0',
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
    'M1',
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
    'M2',
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
    'M3',
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
    'M4',
    'Finalise all answers without changing Q1',
    () => finalise(s, submissionId).then(() => undefined),
    {
      submission: 'submitted',
      answers: {
        Q1: ['a2 evaluated v1 runs=[1/2]', 'a3★ evaluated v2 runs=[2/2]'],
        Q2: ['a1★ evaluated "first answer"'],
      },
    },
    { screenshot: s },
  );

  await steps.step(
    'M5',
    'Grader enters grades (Q1 7, Q2 8) and clicks Publish Grade',
    async () => {
      await openSubmission(g, courseId, assessmentId, submissionId);
      await enterGrade(g, 'Q1 add', 7);
      await enterGrade(g, 'Q2 text', 8);
      await publishGrade(g, submissionId);
    },
    {
      submission: 'published',
      answers: {
        // Publishing publishes every evaluated answer, including the past attempt a2.
        Q1: ['a2 graded v1 runs=[1/2] grade=0', 'a3★ graded v2 runs=[2/2] grade=7'],
        Q2: ['a1★ graded "first answer" grade=8'],
      },
    },
    { screenshot: g },
  );
});
