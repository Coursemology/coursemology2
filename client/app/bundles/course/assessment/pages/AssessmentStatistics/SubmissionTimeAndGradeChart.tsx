import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  BLUE_CHART_BACKGROUND,
  BLUE_CHART_BORDER,
  ORANGE_CHART_BACKGROUND,
  ORANGE_CHART_BORDER,
} from 'theme/colors';

import { SubmissionRecordShape } from 'course/assessment/types';
import GeneralChart from 'lib/components/core/charts/GeneralChart';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAssessmentStatistics } from './selectors';
import { processSubmissionsIntoChartData } from './utils';

const translations = defineMessages({
  lineDatasetLabel: {
    id: 'course.assessment.statistics.submissionTimeGradeChart.lineDatasetLabel',
    defaultMessage: 'Grade',
  },
  barDatasetLabel: {
    id: 'course.assessment.statistics.submissionTimeGradeChart.barDatasetLabel',
    defaultMessage: 'Number of Submissions',
  },
  xAxisLabelWithDeadline: {
    id: 'course.assessment.statistics.submissionTimeGradeChart.xAxisLabel.withDeadline',
    defaultMessage: 'Submission Date Relative to Deadline (D)',
  },
  xAxisLabelWithoutDeadline: {
    id: 'course.assessment.statistics.submissionTimeGradeChart.xAxisLabel.withoutDeadline',
    defaultMessage: 'Submission Date',
  },
});

interface Props {
  ancestorSubmissions?: SubmissionRecordShape[];
  includePhantom: boolean;
}

const SubmissionTimeAndGradeChart: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { ancestorSubmissions, includePhantom } = props;
  const statistics = useAppSelector(getAssessmentStatistics);

  const submissions = statistics.submissions;

  const nonNullSubmissions = submissions.filter((s) => s.answers);
  const includedSubmissions = includePhantom
    ? nonNullSubmissions
    : nonNullSubmissions.filter((s) => !s.courseUser.isPhantom);
  const { labels, lineData, barData } =
    processSubmissionsIntoChartData(includedSubmissions);

  const data = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: t(translations.lineDatasetLabel),
        backgroundColor: ORANGE_CHART_BACKGROUND,
        borderColor: ORANGE_CHART_BORDER,
        borderWidth: 2,
        fill: false,
        data: lineData,
        yAxisID: 'A',
      },
      {
        type: 'bar' as const,
        label: t(translations.barDatasetLabel),
        backgroundColor: BLUE_CHART_BACKGROUND,
        borderColor: BLUE_CHART_BORDER,
        borderWidth: 1,
        data: barData,
        yAxisID: 'B',
      },
    ],
  };

  const hasEndAt = submissions.every((s) => s.endAt != null);

  const options = {
    scales: {
      A: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: t(translations.lineDatasetLabel),
          color: ORANGE_CHART_BORDER,
        },
      },
      B: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: t(translations.barDatasetLabel),
          color: BLUE_CHART_BORDER,
        },
      },
      x: {
        title: {
          display: true,
          text: hasEndAt
            ? t(translations.xAxisLabelWithDeadline)
            : t(translations.xAxisLabelWithoutDeadline),
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <GeneralChart data={data} options={options} type="bar" withZoom />
    </div>
  );
};

export default SubmissionTimeAndGradeChart;
