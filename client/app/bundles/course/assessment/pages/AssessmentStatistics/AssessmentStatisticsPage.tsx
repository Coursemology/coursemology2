import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Box,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import MainGradesChart from './GradeDistribution/MainGradesChart';
import MainSubmissionChart from './SubmissionStatus/MainSubmissionChart';
import MainSubmissionTimeAndGradeStatistics from './SubmissionTimeAndGradeStatistics/MainSubmissionTimeAndGradeStatistics';
import DuplicationHistoryStatistics from './DuplicationHistoryStatistics';
import LiveFeedbackStatistics from './LiveFeedbackStatistics';
import { getAssessmentStatistics } from './selectors';
import StudentAttemptCountTable from './StudentAttemptCountTable';
import StudentGradesPerQuestionTable from './StudentGradesPerQuestionTable';

const translations = defineMessages({
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
  liveFeedback: {
    id: 'course.assessment.statistics.liveFeedback',
    defaultMessage: 'Live Feedback',
  },
  gradesPerQuestion: {
    id: 'course.assessment.statistics.gradesPerQuestion',
    defaultMessage: 'Grades Per Question',
  },
  attemptCount: {
    id: 'course.assessment.statistics.attemptCount',
    defaultMessage: 'Attempt Count',
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

const tabMapping = (includePhantom: boolean): Record<string, JSX.Element> => {
  return {
    gradesPerQuestion: (
      <StudentGradesPerQuestionTable includePhantom={includePhantom} />
    ),
    attemptCount: <StudentAttemptCountTable includePhantom={includePhantom} />,
    gradeDistribution: <MainGradesChart includePhantom={includePhantom} />,
    submissionTimeAndGrade: (
      <MainSubmissionTimeAndGradeStatistics includePhantom={includePhantom} />
    ),
    duplicationHistory: <DuplicationHistoryStatistics />,
    liveFeedback: <LiveFeedbackStatistics includePhantom={includePhantom} />,
  };
};

const AssessmentStatisticsPage: FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('gradesPerQuestion');
  const [includePhantom, setIncludePhantom] = useState(false);

  const statistics = useAppSelector(getAssessmentStatistics);

  const tabComponentMapping = tabMapping(includePhantom);

  return (
    <Page
      backTo={statistics.assessment?.url}
      className="space-y-5"
      title={t(translations.header, {
        title: statistics.assessment?.title ?? '',
      })}
    >
      <>
        <Box className="max-w-full border-b border-divider">
          <MainSubmissionChart includePhantom={includePhantom} />
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
              <Typography className="font-bold">
                {t(translations.includePhantom)}
              </Typography>
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
              id="gradesPerQuestion"
              label={t(translations.gradesPerQuestion)}
              value="gradesPerQuestion"
            />
            <Tab
              className="min-h-12"
              id="attemptCount"
              label={t(translations.attemptCount)}
              value="attemptCount"
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
            {statistics.assessment?.liveFeedbackEnabled && (
              <Tab
                className="min-h-12"
                id="liveFeedback"
                label={t(translations.liveFeedback)}
                value="liveFeedback"
              />
            )}
          </Tabs>
        </Box>

        {tabComponentMapping[tabValue]}
      </>
    </Page>
  );
};

export default AssessmentStatisticsPage;
