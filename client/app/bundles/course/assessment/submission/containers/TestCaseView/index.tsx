import { FC } from 'react';

import { useAppSelector } from 'lib/hooks/store';

import TestCases from '../../components/AnswerDetails/ProgrammingComponent/TestCases';
import { workflowStates } from '../../constants';

interface Props {
  questionId: number;
}

/**
 * The test case panel on the submission edit page.
 *
 * Unlike the other places test cases are rendered, this one honours the grader's "student view"
 * toggle: `graderView` is a UI preference, not a permission, so the panels and columns that exist
 * only for staff have to be hidden here even though the server did send them.
 */
const TestCaseView: FC<Props> = ({ questionId }) => {
  const testCasesState = useAppSelector(
    (state) =>
      state.assessments.submission.gradingResults.testCases[questionId],
  );
  const isAutograding = useAppSelector(
    (state) =>
      state.assessments.submission.questionsFlags[questionId]?.isAutograding,
  );
  const workflowState = useAppSelector(
    (state) => state.assessments.submission.submission.workflowState,
  );
  const graderView = useAppSelector(
    (state) => state.assessments.submission.submission.graderView,
  );
  const showPublicTestCasesOutput = useAppSelector(
    (state) =>
      state.assessments.submission.submission.showPublicTestCasesOutput,
  );
  const showStdoutAndStderr = useAppSelector(
    (state) => state.assessments.submission.submission.showStdoutAndStderr,
  );
  const showPrivate = useAppSelector(
    (state) => state.assessments.submission.assessment.showPrivate,
  );
  const showEvaluation = useAppSelector(
    (state) => state.assessments.submission.assessment.showEvaluation,
  );

  if (!testCasesState) return null;

  const published = workflowState === workflowStates.Published;

  return (
    <TestCases
      canReadTests={testCasesState.canReadTests}
      graderView={graderView}
      isAutograding={isAutograding}
      showEvaluationTestToStudents={published && showEvaluation}
      showPrivateTestToStudents={published && showPrivate}
      showPublicTestCasesOutput={showPublicTestCasesOutput}
      showStdoutAndStderr={showStdoutAndStderr}
      stderr={testCasesState.stderr}
      stdout={testCasesState.stdout}
      testCases={testCasesState.testCases}
      testResults={testCasesState.testResults}
    />
  );
};

export default TestCaseView;
