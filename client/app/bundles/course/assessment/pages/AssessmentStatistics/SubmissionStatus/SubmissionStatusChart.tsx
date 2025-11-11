import palette from 'theme/palette';
import {
  AncestorSubmissionInfo,
  MainSubmissionInfo,
} from 'types/course/statistics/assessmentStatistics';

import { workflowStates } from 'course/assessment/submission/constants';
import { submissionStatusTranslation } from 'course/assessment/submission/translations';
import BarChart from 'lib/components/core/BarChart';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  submissions: MainSubmissionInfo[] | AncestorSubmissionInfo[];
}

const SubmissionStatusChart = (props: Props): JSX.Element => {
  const { submissions } = props;
  const workflowStatesArray = Object.values(workflowStates);

  const { t } = useTranslation();

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
        label: t(submissionStatusTranslation(w)),
      };
    })
    .filter((seg) => seg.count > 0);

  return <BarChart data={data} />;
};

export default SubmissionStatusChart;
