import { FC, useMemo } from 'react';
import { defineMessages } from 'react-intl';
import { GREEN_CHART_BACKGROUND, GREEN_CHART_BORDER } from 'theme/colors';
import { LearningRateRecordEntity } from 'types/course/courseUsers';

import GeneralChart, {
  GeneralChartOptions,
} from 'lib/components/core/charts/GeneralChart';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  datasetLabel: {
    id: 'course.user.userStatistics.LearningRateRecordsChart.datasetLabel',
    defaultMessage: 'Learning Rate',
  },
  yAxisLabel: {
    id: 'course.user.userStatistics.LearningRateRecordsChart.yAxisLabel',
    defaultMessage: 'Learning Rate (%)',
  },
  xAxisLabel: {
    id: 'course.user.userStatistics.LearningRateRecordsChart.xAxisLabel',
    defaultMessage: 'Date',
  },
  note: {
    id: 'course.user.userStatistics.LearningRateRecordsChart.note',
    defaultMessage:
      'Note: A learning rate of 200% means that they can complete the course in half the time.',
  },
});

interface LearningRateRecordsChartProps {
  learningRateRecords: LearningRateRecordEntity[];
}

const LearningRateRecordsChart: FC<LearningRateRecordsChartProps> = (props) => {
  const { learningRateRecords } = props;
  const { t } = useTranslation();

  const sortedRecords = useMemo(
    () =>
      learningRateRecords?.sort(
        (a, b) => a.createdAt.valueOf() - b.createdAt.valueOf(),
      ),
    [learningRateRecords],
  );

  const data = useMemo(
    () => ({
      labels: sortedRecords?.map((r) => r.createdAt),
      datasets: [
        {
          label: t(translations.datasetLabel),
          backgroundColor: GREEN_CHART_BACKGROUND,
          borderColor: GREEN_CHART_BORDER,
          fill: false,
          data: sortedRecords?.map((r) => r.learningRatePercentage),
        },
      ],
    }),
    [sortedRecords, t],
  );

  const options: GeneralChartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (item): string => {
              if (typeof item.raw === 'number') return `${item.raw}%`;
              return '';
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            tooltipFormat: 'YYYY-MM-DD h:mm:ss a',
          },
          title: {
            display: true,
            text: t(translations.xAxisLabel),
          },
        },
        y: {
          title: {
            display: true,
            text: t(translations.yAxisLabel),
          },
        },
      },
    }),
    [t],
  );

  return (
    <div>
      <div>{t(translations.note)}</div>
      <GeneralChart data={data} options={options} type="line" />
    </div>
  );
};

export default LearningRateRecordsChart;
