import { defineMessages, FormattedMessage } from 'react-intl';
import palette from 'theme/palette';
import {
  AncestorSubmissionInfo,
  MainSubmissionInfo,
} from 'types/course/statistics/assessmentStatistics';

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
  submissions: MainSubmissionInfo[] | AncestorSubmissionInfo[];
}

const SubmissionStatusChart = (props: Props): JSX.Element => {
  const { submissions } = props;
  const workflowStatesArray = Object.values(workflowStates);

  const initialCounts = workflowStatesArray.reduce(
    (counts, w) => ({ ...counts, [w]: 0 }),
    {},
  );
  const submissionStateCounts = submissions.reduce((counts, submission) => {
    return {
      ...counts,
      [submission.workflowState ?? workflowStates.Unstarted]:
        counts[submission.workflowState ?? workflowStates.Unstarted] + 1,
    };
  }, initialCounts);

  const data = workflowStatesArray
    .map((w) => {
      const count = submissionStateCounts[w];
      return {
        count,
        color: palette.submissionStatus[w],
        label: <FormattedMessage {...translations[w]} />,
      };
    })
    .filter((seg) => seg.count > 0);

  return <BarChart data={data} />;
};

export default SubmissionStatusChart;
