import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Outlet } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import { fetchStatisticsIndex } from 'course/statistics/operations';
import { StatisticsIndexData } from 'course/statistics/types';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import CustomBadge from 'lib/components/extensions/CustomBadge';
import Preload from 'lib/components/wrappers/Preload';
import { getCourseStatisticsURL } from 'lib/helpers/url-builders';
import { getCourseId, getCurrentPath } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

export const translations = defineMessages({
  assessments: {
    id: 'course.statistics.StatisticsIndex.tabs.assessments',
    defaultMessage: 'Assessments',
  },
  statistics: {
    id: 'course.statistics.StatisticsIndex.header.statistics',
    defaultMessage: 'Statistics',
  },
  courseProgression: {
    id: 'course.statistics.tabs.courseProgression',
    defaultMessage: 'Course Progression',
  },
  coursePerformance: {
    id: 'course.statistics.tabs.coursePerformance',
    defaultMessage: 'Course Performance',
  },
  course: {
    id: 'course.statistics.tabs.course',
    defaultMessage: 'Course',
  },
  students: {
    id: 'course.statistics.StatisticsIndex.tabs.students',
    defaultMessage: 'Students',
  },
  staff: {
    id: 'course.statistics.StatisticsIndex.tabs.staff',
    defaultMessage: 'Staff',
  },
  studentsFailure: {
    id: 'course.statistics.StatisticsIndex.studentsFailure',
    defaultMessage: 'Failed to fetch student data!',
  },
  getHelp: {
    id: 'course.statistics.StatisticsIndex.tabs.getHelp',
    defaultMessage: 'Get Help',
  },
});

interface TabData {
  label: { id: string; defaultMessage: string };
  href: string;
  count?: number;
}

const StatisticsIndex: FC = () => {
  const { t } = useTranslation();
  const statisticsUrl = getCourseStatisticsURL(getCourseId());
  const lastPartOfCurrentPath = getCurrentPath()?.split('/').pop();

  // Move useState to the top level
  const [tabValue, setTabValue] = useState('');

  return (
    <Preload render={<LoadingIndicator />} while={fetchStatisticsIndex}>
      {(data: StatisticsIndexData) => {
        const allTabs = {
          studentsTab: {
            label: translations.students,
            href: 'students',
          },
          staffTab: {
            label: translations.staff,
            href: 'staff',
          },
          courseTab: {
            label: translations.course,
            href: 'course',
          },
          assessmentTab: {
            label: translations.assessments,
            href: 'assessments',
          },
          getHelpTab: {
            label: translations.getHelp,
            href: 'get_help',
          },
        };

        const tabs: TabData[] = [
          allTabs.studentsTab,
          allTabs.staffTab,
          allTabs.courseTab,
          allTabs.assessmentTab,
          // Only show getHelpTab if codaveri component is enabled
          ...(data.codaveriComponentEnabled ? [allTabs.getHelpTab] : []),
        ];

        // Calculate default tab value and update state if needed
        const defaultTabValue =
          tabs.filter((tab) => tab.href === lastPartOfCurrentPath)[0]?.href ||
          '';

        // Update tabValue if it's empty or if the current path doesn't match any available tabs
        if (tabValue === '' || !tabs.some((tab) => tab.href === tabValue)) {
          setTabValue(defaultTabValue);
        }

        return (
          <Page title={t(translations.statistics)} unpadded>
            <Box className="max-w-full border-b border-divider">
              <Tabs
                aria-label="Statistics Index Tabs"
                onChange={(_, value) => {
                  setTabValue(value);
                }}
                scrollButtons="auto"
                sx={tabsStyle}
                TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
                value={tabValue}
                variant="scrollable"
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={tab.label.id}
                    component={Link}
                    icon={
                      <CustomBadge badgeContent={tab.count} color="error" />
                    }
                    iconPosition="end"
                    label={t(tab.label)}
                    style={{
                      minHeight: 48,
                      paddingRight:
                        tab.count === 0 || tab.count === undefined ? 8 : 26,
                      textDecoration: 'none',
                    }}
                    to={`${statisticsUrl}/${tab.href}`}
                    value={tab.href}
                  />
                ))}
              </Tabs>
            </Box>

            <Outlet />
          </Page>
        );
      }}
    </Preload>
  );
};

const handle = translations.statistics;

export default Object.assign(StatisticsIndex, { handle });
