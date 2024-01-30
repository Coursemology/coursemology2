import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  BLUE_CHART_BACKGROUND,
  BLUE_CHART_BORDER,
  ORANGE_CHART_BACKGROUND,
  ORANGE_CHART_BORDER,
} from 'theme/colors';

import GeneralChart from 'lib/components/core/charts/GeneralChart';
import useTranslation from 'lib/hooks/useTranslation';

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
  barData: number[];
  hasEndAt: boolean;
  labels: string[];
  lineData: number[];
}

const SubmissionTimeAndGradeChart: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { barData, hasEndAt, labels, lineData } = props;

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
