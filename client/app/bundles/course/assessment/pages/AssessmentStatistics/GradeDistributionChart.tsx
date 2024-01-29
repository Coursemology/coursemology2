import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { GREEN_CHART_BACKGROUND, GREEN_CHART_BORDER } from 'theme/colors';

import { SubmissionRecordShape } from 'course/assessment/types';
import ViolinChart from 'lib/components/core/charts/ViolinChart';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAssessmentStatistics } from './selectors';

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
  ancestorSubmissions?: SubmissionRecordShape[];
  includePhantom: boolean;
}

const GradeDistributionChart: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { includePhantom, ancestorSubmissions } = props;

  const statistics = useAppSelector(getAssessmentStatistics);
  const submissions = statistics.submissions;
  const nonNullSubmissions = submissions.filter((s) => s.answers);

  const includedSubmissions = includePhantom
    ? nonNullSubmissions
    : nonNullSubmissions.filter((s) => !s.courseUser.isPhantom);

  const totalGrades =
    includedSubmissions
      ?.filter((s) => s.totalGrade)
      ?.map((s) => s.totalGrade) ?? [];
  const data = {
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
      <ViolinChart data={data} options={options} />
    </div>
  );
};

export default GradeDistributionChart;
