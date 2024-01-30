import { FC, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, Typography } from '@mui/material';
import {
  AncestorSubmissionInfo,
  StudentInfo,
} from 'types/course/statistics/assessmentStatistics';

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
});

interface Props {
  submissions: AncestorSubmissionInfo[];
  allStudents: StudentInfo[];
}

const CardTitle: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography className="font-bold mb-4" variant="h6">
    {children}
  </Typography>
);

const StatisticsCharts: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { submissions, allStudents } = props;

  return (
    <div className="full-w space-y-4">
      <Card variant="outlined">
        <CardContent>
          <CardTitle>{t(translations.submissionStatuses)}</CardTitle>
          <AncestorSubmissionChart
            ancestorAllStudents={allStudents}
            ancestorSubmissions={submissions}
          />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <CardTitle>{t(translations.gradeDistribution)}</CardTitle>
          <AncestorGradesChart ancestorSubmissions={submissions} />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <CardTitle>{t(translations.submissionTimeAndGrade)}</CardTitle>
          <AncestorSubmissionTimeAndGradeStatistics
            ancestorSubmissions={submissions}
          />
        </CardContent>
      </Card>
      {/* TODO: Add section on hardest questions */}
    </div>
  );
};

export default StatisticsCharts;
