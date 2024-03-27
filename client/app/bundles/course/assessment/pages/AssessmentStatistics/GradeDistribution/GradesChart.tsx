import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { GREEN_CHART_BACKGROUND, GREEN_CHART_BORDER } from 'theme/colors';

import ViolinChart from 'lib/components/core/charts/ViolinChart';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  yAxisLabel: {
    id: 'course.assessment.statistics.gradeViolin.yAxisLabel',
    defaultMessage: 'Submissions',
  },
  xAxisLabel: {
    id: 'course.assessment.statistics.gradeViolin.xAxisLabel',
    defaultMessage: 'Grades',
  },
  datasetLabel: {
    id: 'course.assessment.statistics.gradeViolin.datasetLabel',
    defaultMessage: 'Distribution',
  },
});

interface Props {
  totalGrades: (number | null | undefined)[];
}

const GradesChart: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { totalGrades } = props;

  const transformedData = {
    labels: [t(translations.yAxisLabel)],
    datasets: [
      {
        label: t(translations.datasetLabel),
        backgroundColor: GREEN_CHART_BACKGROUND,
        borderColor: GREEN_CHART_BORDER,
        borderWidth: 1,
        data: [totalGrades],
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    legend: {
      position: 'top',
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t(translations.xAxisLabel),
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col items-center">
      <ViolinChart data={transformedData} options={options} />
    </div>
  );
};

export default GradesChart;
