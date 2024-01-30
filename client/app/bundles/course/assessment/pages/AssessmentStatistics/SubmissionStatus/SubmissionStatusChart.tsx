import { defineMessages, FormattedMessage } from 'react-intl';
import palette from 'theme/palette';
import { WorkflowState } from 'types/course/assessment/submission/submission';

import { workflowStates } from 'course/assessment/submission/constants';
import BarChart from 'lib/components/core/BarChart';

const translations = defineMessages({
  datasetLabel: {
    id: 'course.assessment.statistics.SubmissionStatusChart.datasetLabel',
    defaultMessage: 'Student Submission Statuses',
  },
  published: {
    id: 'course.assessment.statistics.SubmissionStatusChart.published',
    defaultMessage: 'Graded',
  },
  graded: {
    id: 'course.assessment.statistics.SubmissionStatusChart.graded',
    defaultMessage: 'Graded, unpublished',
  },
  submitted: {
    id: 'course.assessment.statistics.SubmissionStatusChart.submitted',
    defaultMessage: 'Submitted',
  },
  attempting: {
    id: 'course.assessment.statistics.SubmissionStatusChart.attempting',
    defaultMessage: 'Attempting',
  },
  unattempted: {
    id: 'course.assessment.statistics.SubmissionStatusChart.unattempted',
    defaultMessage: 'Not Started',
  },
});

interface Props {
  numStudents: number;
  submissionWorkflowStates: WorkflowState[];
}

const SubmissionStatusChart = (props: Props): JSX.Element => {
  const { numStudents, submissionWorkflowStates } = props;

  const numUnstarted = numStudents - submissionWorkflowStates.length;
  const numAttempting = submissionWorkflowStates.filter(
    (workflow) => workflow === workflowStates.Attempting,
  ).length;
  const numSubmitted = submissionWorkflowStates.filter(
    (workflow) => workflow === workflowStates.Submitted,
  ).length;
  const numGraded = submissionWorkflowStates.filter(
    (workflow) => workflow === workflowStates.Graded,
  ).length;
  const numPublished = submissionWorkflowStates.filter(
    (workflow) => workflow === workflowStates.Published,
  ).length;

  const data = [
    {
      color: palette.submissionStatus[workflowStates.Unstarted],
      count: numUnstarted,
      label: <FormattedMessage {...translations.unattempted} />,
    },
    {
      color: palette.submissionStatus[workflowStates.Attempting],
      count: numAttempting,
      label: <FormattedMessage {...translations.attempting} />,
    },
    {
      color: palette.submissionStatus[workflowStates.Submitted],
      count: numSubmitted,
      label: <FormattedMessage {...translations.submitted} />,
    },
    {
      color: palette.submissionStatus[workflowStates.Graded],
      count: numGraded,
      label: <FormattedMessage {...translations.graded} />,
    },
    {
      color: palette.submissionStatus[workflowStates.Published],
      count: numPublished,
      label: <FormattedMessage {...translations.published} />,
    },
  ];

  return <BarChart data={data} />;
};

export default SubmissionStatusChart;
