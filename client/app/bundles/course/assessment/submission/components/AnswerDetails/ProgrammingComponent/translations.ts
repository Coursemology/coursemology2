import { defineMessages } from 'react-intl';

// Shared by the test case panel and its output streams, wherever they are rendered: the submission
// edit page, past answers, and assessment statistics. The `TestCaseView` id prefix is kept so the
// existing translations continue to resolve.
export default defineMessages({
  expression: {
    id: 'course.assessment.submission.TestCaseView.experession',
    defaultMessage: 'Expression',
  },
  expected: {
    id: 'course.assessment.submission.TestCaseView.expected',
    defaultMessage: 'Expected',
  },
  output: {
    id: 'course.assessment.submission.TestCaseView.output',
    defaultMessage: 'Output',
  },
  allPassed: {
    id: 'course.assessment.submission.TestCaseView.allPassed',
    defaultMessage: 'All passed',
  },
  allFailed: {
    id: 'course.assessment.submission.TestCaseView.allFailed',
    defaultMessage: 'All failed',
  },
  testCasesPassed: {
    id: 'course.assessment.submission.TestCaseView.testCasesPassed',
    defaultMessage: '{numPassed}/{numTestCases} passed',
  },
  publicTestCases: {
    id: 'course.assessment.submission.TestCaseView.publicTestCases',
    defaultMessage: 'Public Test Cases',
  },
  privateTestCases: {
    id: 'course.assessment.submission.TestCaseView.privateTestCases',
    defaultMessage: 'Private Test Cases',
  },
  evaluationTestCases: {
    id: 'course.assessment.submission.TestCaseView.evaluationTestCases',
    defaultMessage: 'Evaluation Test Cases',
  },
  staffOnlyTestCases: {
    id: 'course.assessment.submission.TestCaseView.staffOnlyTestCases',
    defaultMessage: 'Only staff can see this.',
  },
  staffOnlyOutputStream: {
    id: 'course.assessment.submission.TestCaseView.staffOnlyOutputStream',
    defaultMessage:
      "Only staff can see this. Students can't see output streams.",
  },
  standardOutput: {
    id: 'course.assessment.submission.TestCaseView.standardOutput',
    defaultMessage: 'Standard Output',
  },
  standardError: {
    id: 'course.assessment.submission.TestCaseView.standardError',
    defaultMessage: 'Standard Error',
  },
  autogradeProgress: {
    id: 'course.assessment.submission.TestCaseView.autogradeProgress',
    defaultMessage:
      'The answer is currently being evaluated, come back after a while to see the latest results.',
  },
  noOutputs: {
    id: 'course.assessment.submission.TestCaseView.noOutputs',
    defaultMessage: 'No outputs',
  },
});
