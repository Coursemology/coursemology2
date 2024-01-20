import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import { fetchStatistics } from 'course/assessment/operations';
import { SubmissionRecordShape } from 'course/assessment/types';
import Page from 'lib/components/core/layouts/Page';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicationHistoryStatistics from './DuplicationHistoryStatistics';
import GradeDistributionChart from './GradeDistributionChart';
import { getStatisticsPage } from './selectors';
import StatisticsTablePanel from './StatisticsTablePanel';
import SubmissionBarChart from './SubmissionBarChart';
import SubmissionTimeAndGradeChart from './SubmissionTimeAndGradeChart';

const translations = defineMessages({
  statistics: {
    id: 'course.assessment.statistics.statistics',
    defaultMessage: 'Statistics',
  },
  header: {
    id: 'course.assessment.statistics.header',
    defaultMessage: 'Statistics for {title}',
  },
  fetchFailure: {
    id: 'course.assessment.statistics.fail',
    defaultMessage: 'Failed to fetch statistics.',
  },
  fetchAncestorsFailure: {
    id: 'course.assessment.statistics.ancestorFail',
    defaultMessage: 'Failed to fetch past iterations of this assessment.',
  },
  fetchAncestorStatisticsFailure: {
    id: 'course.assessment.statistics.ancestorStatisticsFail',
    defaultMessage: "Failed to fetch ancestor's statistics.",
  },
  duplicationHistory: {
    id: 'course.assessment.statistics.duplicationHistory',
    defaultMessage: 'Duplication History',
  },
  table: {
    id: 'course.assessment.statistics.table',
    defaultMessage: 'Table',
  },
  submissionStatus: {
    id: 'course.assessment.statistics.submissionStatus',
    defaultMessage: 'Submission Status',
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

const AssessmentStatisticsPage: FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('table');
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);
  const dispatch = useAppDispatch();

  const statisticsPage = useAppSelector(getStatisticsPage);
  const submissions = statisticsPage.submissions as SubmissionRecordShape[];
  const numStudents = statisticsPage.allStudents.length;

  useEffect(() => {
    if (assessmentId) {
      dispatch(
        fetchStatistics(parsedAssessmentId, t(translations.fetchFailure)),
      );
    }
  }, [assessmentId]);

  const tabComponentMapping = {
    table: <StatisticsTablePanel />,
    duplicationHistory: <DuplicationHistoryStatistics />,
    submissionStatus: (
      <SubmissionBarChart numStudents={numStudents} submissions={submissions} />
    ),
    gradeDistribution: <GradeDistributionChart submissions={submissions} />,
    submissionTimeAndGrade: (
      <SubmissionTimeAndGradeChart submissions={submissions} />
    ),
  };

  return (
    <Page
      backTo={statisticsPage.assessment?.url}
      className="space-y-5"
      title={t(translations.header, {
        title: statisticsPage.assessment?.title,
      })}
    >
      <>
        <Box className="max-w-full border-b border-divider">
          <Tabs
            onChange={(_, value): void => {
              setTabValue(value);
            }}
            scrollButtons="auto"
            sx={tabsStyle}
            TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
            value={tabValue}
            variant="scrollable"
          >
            <Tab
              className="min-h-12"
              id="table"
              label={t(translations.table)}
              value="table"
            />
            <Tab
              className="min-h-12"
              id="duplicationHistory"
              label={t(translations.duplicationHistory)}
              value="duplicationHistory"
            />
            <Tab
              className="min-h-12"
              id="submissionStatus"
              label={t(translations.submissionStatus)}
              value="submissionStatus"
            />
            <Tab
              className="min-h-12"
              id="gradeDistribution"
              label={t(translations.gradeDistribution)}
              value="gradeDistribution"
            />
            <Tab
              className="min-h-12"
              id="submissionTimeAndGrade"
              label={t(translations.submissionTimeAndGrade)}
              value="submissionTimeAndGrade"
            />
          </Tabs>
        </Box>

        {tabComponentMapping[tabValue]}
      </>
    </Page>
  );
};

const handle = translations.statistics;

export default Object.assign(AssessmentStatisticsPage, { handle });
