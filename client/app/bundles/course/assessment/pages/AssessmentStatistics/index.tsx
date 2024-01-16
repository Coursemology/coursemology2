import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import { fetchStatistics } from 'course/assessment/operations';
import Page from 'lib/components/core/layouts/Page';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getStatisticsPage } from './selectors';
import StatisticsChartsPanel from './StatisticsChartsPanel';

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
  chart: {
    id: 'course.assessment.statistics.chart',
    defaultMessage: 'Chart',
  },
  table: {
    id: 'course.assessment.statistics.table',
    defaultMessage: 'Table',
  },
});

const AssessmentStatisticsPage: FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('table');
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);
  const dispatch = useAppDispatch();

  const statisticsPage = useAppSelector(getStatisticsPage);

  useEffect(() => {
    if (assessmentId) {
      dispatch(
        fetchStatistics(parsedAssessmentId, t(translations.fetchFailure)),
      );
    }
  }, [assessmentId]);

  const tabComponentMapping = {
    chart: <StatisticsChartsPanel />,
    table: <StatisticsChartsPanel />,
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
              id="chart"
              label={t(translations.chart)}
              value="chart"
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
