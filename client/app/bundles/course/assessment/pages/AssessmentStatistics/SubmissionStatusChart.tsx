import { defineMessages, FormattedMessage } from 'react-intl';
import palette from 'theme/palette';

import { workflowStates } from 'course/assessment/submission/constants';
import {
  CourseUserShape,
  SubmissionRecordShape,
} from 'course/assessment/types';
import BarChart from 'lib/components/core/BarChart';
import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentStatistics } from './selectors';

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
  ancestorSubmissions?: SubmissionRecordShape[];
  ancestorAllStudents?: CourseUserShape[];
  includePhantom: boolean;
}

const SubmissionStatusChart = (props: Props): JSX.Element => {
  const { ancestorSubmissions, includePhantom, ancestorAllStudents } = props;
  const statistics = useAppSelector(getAssessmentStatistics);

  const submissions = statistics.submissions.slice();
  const allStudents = statistics.allStudents.slice();

  const nonNullSubmissions = submissions.filter((s) => s.submissionExists);

  const numStudents = includePhantom
    ? allStudents.length
    : allStudents.filter((s) => !s.isPhantom).length;
  const includedSubmissions = includePhantom
    ? nonNullSubmissions
    : nonNullSubmissions.filter((s) => !s.courseUser.isPhantom);

  const numUnstarted = numStudents - includedSubmissions.length;
  const numAttempting = includedSubmissions.filter(
    (s) => s.workflowState === workflowStates.Attempting,
  ).length;
  const numSubmitted = includedSubmissions.filter(
    (s) => s.workflowState === workflowStates.Submitted,
  ).length;
  const numGraded = includedSubmissions.filter(
    (s) => s.workflowState === workflowStates.Graded,
  ).length;
  const numPublished = includedSubmissions.filter(
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

export default SubmissionStatusChart;
