import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ChartOptions, TooltipItem } from 'chart.js';
import { GREEN_CHART_BACKGROUND, GREEN_CHART_BORDER } from 'theme/colors';

import LineChart from 'lib/components/core/charts/LineChart';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  yAxisLabel: {
    id: 'course.assessment.statistics.gradeDistribution.yAxisLabel',
    defaultMessage: 'Submissions',
  },
  xAxisLabel: {
    id: 'course.assessment.statistics.gradeDistribution.xAxisLabel',
    defaultMessage: 'Grades',
  },
  datasetLabel: {
    id: 'course.assessment.statistics.gradeDistribution.datasetLabel',
    defaultMessage: 'Distribution',
  },
});

interface Props {
  totalGrades: (number | null | undefined)[];
  maximumGrade?: number;
}

const GradesChart: FC<Props> = ({ totalGrades, maximumGrade }) => {
  const { t } = useTranslation();

  const validGrades = totalGrades.filter((g): g is number => g != null);
  const frequencyMap = new Map<number, number>();

  validGrades.forEach((g) => {
    frequencyMap.set(g, (frequencyMap.get(g) || 0) + 1);
  });

  const maxGrade = maximumGrade ?? Math.max(0, ...validGrades);

  // Generate labels: all integers from 0 to maxGrade
  const integerLabels = Array.from(
    { length: Math.floor(maxGrade) + 1 },
    (_, i) => i,
  );

  // Add any non-integer grades found
  const nonIntegerLabels = [
    ...new Set(validGrades.filter((g) => !Number.isInteger(g))),
  ];

  const combinedLabels = Array.from(
    new Set([...integerLabels, ...nonIntegerLabels]),
  ).sort((a, b) => a - b);

  const frequencies = combinedLabels.map(
    (grade) => frequencyMap.get(grade) ?? 0,
  );
  const maxCount = Math.max(0, ...frequencies);

  const data = {
    labels: combinedLabels,
    datasets: [
      {
        label: t(translations.datasetLabel),
        data: frequencies,
        borderColor: GREEN_CHART_BORDER,
        backgroundColor: GREEN_CHART_BACKGROUND,
        fill: true,
        tension: 0.4,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: ([item]: TooltipItem<'line'>[]) => `Grade: ${item.label}`,
          label: (item: TooltipItem<'line'>) => {
            const label = String(item.label);
            const raw = Number(item.raw);
            return `${label}: ${raw} submission${raw !== 1 ? 's' : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: t(translations.xAxisLabel) },
        type: 'linear',
        min: 0,
        max: maxGrade,
        ticks: { stepSize: 1 },
      },
      y: {
        title: { display: true, text: t(translations.yAxisLabel) },
        min: 0,
        max: maxCount + 1,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="w-full flex flex-col items-center">
      <LineChart data={data} options={options} />
    </div>
  );
};

export default GradesChart;
