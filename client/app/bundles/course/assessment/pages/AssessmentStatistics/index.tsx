import { FC, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, FormControlLabel, Switch, Tab, Tabs } from '@mui/material';

import { fetchAssessmentStatistics } from 'course/assessment/operations/statistics';
import { statisticsActions as actions } from 'course/assessment/reducers/statistics';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicationHistoryStatistics from './DuplicationHistoryStatistics';
import GradeDistributionChart from './GradeDistributionChart';
import { getAssessmentStatistics } from './selectors';
import StudentMarksPerQuestionTable from './StudentMarksPerQuestionTable';
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

  const statistics = useAppSelector(getAssessmentStatistics);

  useEffect(() => {
    dispatch(actions.reset());
    dispatch(fetchAssessmentStatistics(parsedAssessmentId)).catch(() =>
      toast.error(t(translations.fetchFailure)),
    );
  }, [dispatch, parsedAssessmentId]);

  const tabComponentMapping = {
    marksPerQuestion: (
      <StudentMarksPerQuestionTable includePhantom={includePhantom} />
    ),
    gradeDistribution: (
      <GradeDistributionChart includePhantom={includePhantom} />
    ),
    submissionTimeAndGrade: (
      <SubmissionTimeAndGradeChart includePhantom={includePhantom} />
    ),
    duplicationHistory: <DuplicationHistoryStatistics />,
  };

  if (statistics.isLoading) {
    return <LoadingIndicator />;
  }

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
          <SubmissionStatusChart includePhantom={includePhantom} />
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
