import { FC, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, Typography } from '@mui/material';
import { AncestorSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import useTranslation from 'lib/hooks/useTranslation';

import AncestorGradesChart from './GradeDistribution/AncestorGradesChart';
import AncestorSubmissionChart from './SubmissionStatus/AncestorSubmissionChart';
import AncestorSubmissionTimeAndGradeStatistics from './SubmissionTimeAndGradeStatistics/AncestorSubmissionTimeAndGradeStatistics';

const translations = defineMessages({
  submissionStatuses: {
    id: 'course.assessment.statistics.submissionStatuses',
    defaultMessage: 'Submission Statuses',
  },
  gradeDistribution: {
    id: 'course.assessment.statistics.gradeDistribution',
    defaultMessage: 'Grade Distribution',
  },
  submissionTimeAndGrade: {
    id: 'course.assessment.statistics.submissionTimeAndGrade',
    defaultMessage: 'Submission Time and Grade',
  },
  noIncludePhantom: {
    id: 'course.assessment.statistics.noIncludePhantom',
    defaultMessage:
      '*All statistics in this duplicated assessments does not include Phantom Students',
  },
});

interface Props {
  submissions: AncestorSubmissionInfo[];
}

const CardTitle: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography className="font-bold mb-4" variant="h6">
    {children}
  </Typography>
);

const StatisticsCharts: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { submissions } = props;

  const noPhantomSubmissions = submissions.filter(
    (s) => !s.courseUser.isPhantom,
  );

  return (
    <div className="full-w space-y-4">
      <Typography className="mt-2 italic" variant="body2">
        {t(translations.noIncludePhantom)}
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <CardTitle>{t(translations.submissionStatuses)}</CardTitle>
          <AncestorSubmissionChart ancestorSubmissions={noPhantomSubmissions} />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <CardTitle>{t(translations.gradeDistribution)}</CardTitle>
          <AncestorGradesChart ancestorSubmissions={noPhantomSubmissions} />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <CardTitle>{t(translations.submissionTimeAndGrade)}</CardTitle>
          <AncestorSubmissionTimeAndGradeStatistics
            ancestorSubmissions={noPhantomSubmissions}
          />
        </CardContent>
      </Card>
      {/* TODO: Add section on hardest questions */}
    </div>
  );
};

export default StatisticsCharts;
