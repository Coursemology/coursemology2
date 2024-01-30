import { WorkflowState } from 'types/course/assessment/submission/submission';
import {
  AncestorSubmissionInfo,
  StudentInfo,
} from 'types/course/statistics/assessmentStatistics';

import SubmissionStatusChart from './SubmissionStatusChart';

interface Props {
  ancestorSubmissions: AncestorSubmissionInfo[];
  ancestorAllStudents: StudentInfo[];
}

const AncestorSubmissionChart = (props: Props): JSX.Element => {
  const { ancestorSubmissions, ancestorAllStudents } = props;

  const numStudents = ancestorAllStudents.length;
  const submissionWorkflowStates = ancestorSubmissions.map(
    (s) => s.workflowState as WorkflowState,
  );

  return (
    <SubmissionStatusChart
      numStudents={numStudents}
      submissionWorkflowStates={submissionWorkflowStates}
    />
  );
};

export default AncestorSubmissionChart;
