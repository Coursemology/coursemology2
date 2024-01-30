import { WorkflowState } from 'types/course/assessment/submission/submission';

import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentStatistics } from '../selectors';

import SubmissionStatusChart from './SubmissionStatusChart';

interface Props {
  includePhantom: boolean;
}

const MainSubmissionChart = (props: Props): JSX.Element => {
  const { includePhantom } = props;
  const statistics = useAppSelector(getAssessmentStatistics);

  const submissions = statistics.submissions;
  const allStudents = statistics.allStudents;

  const nonNullSubmissions = submissions.filter((s) => s.submissionExists);

  const numStudents = includePhantom
    ? allStudents.length
    : allStudents.filter((s) => !s.isPhantom).length;
  const includedSubmissions = includePhantom
    ? nonNullSubmissions
    : nonNullSubmissions.filter((s) => !s.courseUser.isPhantom);
  const submissionWorkflowStates = includedSubmissions.map(
    (s) => s.workflowState as WorkflowState,
  );

  return (
    <SubmissionStatusChart
      numStudents={numStudents}
      submissionWorkflowStates={submissionWorkflowStates}
    />
  );
};

export default MainSubmissionChart;
