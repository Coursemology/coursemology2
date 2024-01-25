import { FC, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, FormControlLabel, Switch, Tab, Tabs } from '@mui/material';

import { fetchStatistics } from 'course/assessment/operations';
import { SubmissionRecordShape } from 'course/assessment/types';
import Page from 'lib/components/core/layouts/Page';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicationHistoryStatistics from './DuplicationHistoryStatistics';
import GradeDistributionChart from './GradeDistributionChart';
import { getStatisticsPage } from './selectors';
import StudentMarksPerQuestionPage from './StudentMarksPerQuestionPage';
import SubmissionStatusChart from './SubmissionStatusChart';
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
  marksPerQuestion: {
    id: 'course.assessment.statistics.marksPerQuestion',
    defaultMessage: 'Marks Per Question',
  },
  gradeDistribution: {
    id: 'course.assessment.statistics.gradeDistribution',
    defaultMessage: 'Grade Distribution',
  },
  submissionTimeAndGrade: {
    id: 'course.assessment.statistics.submissionTimeAndGrade',
    defaultMessage: 'Submission Time and Grade',
  },
  includePhantom: {
    id: 'course.assessment.statistics.includePhantom',
    defaultMessage: 'Include Phantom Student',
  },
});

const AssessmentStatisticsPage: FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('marksPerQuestion');
  const [includePhantom, setIncludePhantom] = useState(false);

  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);
  const dispatch = useAppDispatch();

  const statisticsPage = useAppSelector(getStatisticsPage);
  const allStudents = statisticsPage.allStudents;

  useEffect(() => {
    if (assessmentId) {
      dispatch(
        fetchStatistics(parsedAssessmentId, t(translations.fetchFailure)),
      );
    }
  }, [assessmentId]);

  const submissions = statisticsPage.submissions as SubmissionRecordShape[];

  const tabComponentMapping = {
    marksPerQuestion: (
      <StudentMarksPerQuestionPage includePhantom={includePhantom} />
    ),
    gradeDistribution: (
      <GradeDistributionChart
        includePhantom={includePhantom}
        submissions={submissions}
      />
    ),
    submissionTimeAndGrade: (
      <SubmissionTimeAndGradeChart
        includePhantom={includePhantom}
        submissions={submissions}
      />
    ),
    duplicationHistory: <DuplicationHistoryStatistics />,
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
          <SubmissionStatusChart
            allStudents={allStudents}
            includePhantom={includePhantom}
            submissions={submissions}
          />
          <FormControlLabel
            className="mt-2"
            control={
              <Switch
                checked={includePhantom}
                className="toggle-phantom"
                color="primary"
                onChange={() => setIncludePhantom(!includePhantom)}
              />
            }
            label={
              <b>
                <FormattedMessage {...translations.includePhantom} />
              </b>
            }
            labelPlacement="end"
          />
          <Tabs
            className="sticky top-0 z-20 h-20 mt-2 bg-white border-only-b-neutral-200"
            onChange={(_, value): void => {
              setTabValue(value);
            }}
            scrollButtons="auto"
            value={tabValue}
            variant="scrollable"
          >
            <Tab
              className="min-h-12"
              id="marksPerQuestion"
              label={t(translations.marksPerQuestion)}
              value="marksPerQuestion"
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
            <Tab
              className="min-h-12"
              id="duplicationHistory"
              label={t(translations.duplicationHistory)}
              value="duplicationHistory"
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
