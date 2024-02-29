import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';

import Page from 'lib/components/core/layouts/Page';
import useTranslation from 'lib/hooks/useTranslation';

import CourseStatistics from './course/CourseStatistics';
import StaffStatistics from './staff/StaffStatistics';
import StudentsStatistics from './students/StudentsStatistics';

const translations = defineMessages({
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
});

const StatisticsIndex: FC = () => {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState('students');

  const tabComponentMapping = {
    students: <StudentsStatistics />,
    staff: <StaffStatistics />,
    course: <CourseStatistics />,
  };

  return (
    <Page title={t(translations.statistics)} unpadded>
      <>
        <Box className="max-w-full border-b border-divider">
          <Tabs
            aria-label="Statistics Index Tabs"
            onChange={(_event, value) => setTabValue(value)}
            scrollButtons="auto"
            sx={tabsStyle}
            TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
            value={tabValue}
            variant="scrollable"
          >
            <Tab
              className="min-h-12"
              id="experience-points-tab"
              label={t(translations.students)}
              value="students"
            />
            <Tab
              className="min-h-12"
              id="forum-disbursement-tab"
              label={t(translations.staff)}
              value="staff"
            />
            <Tab
              className="min-h-12"
              id="general-disbursement-tab"
              label={t(translations.course)}
              value="course"
            />
          </Tabs>
        </Box>

        {tabComponentMapping[tabValue]}
      </>
    </Page>
  );
};

const handle = translations.statistics;

export default Object.assign(StatisticsIndex, { handle });
