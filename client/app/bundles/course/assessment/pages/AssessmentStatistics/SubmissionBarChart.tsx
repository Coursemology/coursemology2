import { defineMessages, FormattedMessage } from 'react-intl';
import palette from 'theme/palette';

import { workflowStates } from 'course/assessment/submission/constants';
import { SubmissionRecordShape } from 'course/assessment/types';
import BarChart from 'lib/components/core/BarChart';

const translations = defineMessages({
  datasetLabel: {
    id: 'course.assessment.statistics.SubmissionBarChart.datasetLabel',
    defaultMessage: 'Student Submission Statuses',
  },
  published: {
    id: 'course.assessment.statistics.SubmissionBarChart.published',
    defaultMessage: 'Graded',
  },
  graded: {
    id: 'course.assessment.statistics.SubmissionBarChart.graded',
    defaultMessage: 'Graded, unpublished',
  },
  submitted: {
    id: 'course.assessment.statistics.SubmissionBarChart.submitted',
    defaultMessage: 'Submitted',
  },
  attempting: {
    id: 'course.assessment.statistics.SubmissionBarChart.attempting',
    defaultMessage: 'Attempting',
  },
  unattempted: {
    id: 'course.assessment.statistics.SubmissionBarChart.unattempted',
    defaultMessage: 'Not Started',
  },
});

interface Props {
  submissions: SubmissionRecordShape[];
  numStudents: number;
}

// need to refactor!!
const SubmissionBarChart = (props: Props): JSX.Element => {
  const { submissions, numStudents } = props;

  const numUnstarted = numStudents - submissions.length;
  const numAttempting = submissions.filter(
    (s) => s.workflowState === workflowStates.Attempting,
  ).length;
  const numSubmitted = submissions.filter(
    (s) => s.workflowState === workflowStates.Submitted,
  ).length;
  const numGraded = submissions.filter(
    (s) => s.workflowState === workflowStates.Graded,
  ).length;
  const numPublished = submissions.filter(
    (s) => s.workflowState === workflowStates.Published,
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

export default SubmissionBarChart;
