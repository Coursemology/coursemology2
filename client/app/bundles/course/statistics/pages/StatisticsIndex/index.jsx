import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';

import NotificationBar from 'lib/components/core/NotificationBar';
import PageHeader from 'lib/components/navigation/PageHeader';

import {
  fetchCoursePerformanceStatistics,
  fetchCourseProgressionStatistics,
  fetchStaffStatistics,
  fetchStudentsStatistics,
} from '../../actions';
import { courseIndexShape } from '../../propTypes/course';
import { staffIndexShape } from '../../propTypes/staff';
import { studentsIndexShape } from '../../propTypes/students';

import CourseStatistics from './course';
import StaffStatistics from './staff';
import StudentsStatistics from './students';

const translations = defineMessages({
  statistics: {
    id: 'course.statistics.StatisticsIndex.header.statistics',
    defaultMessage: 'Statistics',
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
  courseProgressionFailure: {
    id: 'course.statistics.failures.courseProgression',
    defaultMessage: 'Failed to fetch course progression data!',
  },
  coursePerformanceFailure: {
    id: 'course.statistics.failures.coursePerformance',
    defaultMessage: 'Failed to fetch course performance data!',
  },
  studentsFailure: {
    id: 'course.statistics.StatisticsIndex.studentsFailure',
    defaultMessage: 'Failed to fetch student data!',
  },
  staffFailure: {
    id: 'course.statistics.StatisticsIndex.staffFailure',
    defaultMessage: 'Failed to fetch staff data!',
  },
});

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      aria-labelledby={`statistics-tab-${index}`}
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      role="tabpanel"
      {...other}
    >
      {value === index && <Box sx={{ pt: 3, pb: 3 }}>{children}</Box>}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const a11yProps = (index) => ({
  id: `statistics-tab-${index}`,
  'aria-controls': `statistics-tabpanel-${index}`,
});

const StatisticsIndex = ({
  dispatch,
  courseStatistics,
  studentsStatistics,
  staffStatistics,
}) => {
  const [value, setValue] = useState(0);
  const intl = useIntl();

  useEffect(() => {
    dispatch(
      fetchCourseProgressionStatistics(
        intl.formatMessage(translations.courseProgressionFailure),
      ),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchCoursePerformanceStatistics(
        intl.formatMessage(translations.coursePerformanceFailure),
      ),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStudentsStatistics(intl.formatMessage(translations.studentsFailure)),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStaffStatistics(intl.formatMessage(translations.staffFailure)),
    );
  }, [dispatch]);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.statistics)} />
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="Statistics Index Tabs"
            onChange={handleChange}
            value={value}
          >
            <Tab
              label={intl.formatMessage(translations.students)}
              {...a11yProps(0)}
            />
            <Tab
              label={intl.formatMessage(translations.staff)}
              {...a11yProps(1)}
            />
            <Tab
              label={intl.formatMessage(translations.course)}
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <TabPanel index={0} value={value}>
          <StudentsStatistics {...studentsStatistics} />
        </TabPanel>
        <TabPanel index={1} value={value}>
          <StaffStatistics {...staffStatistics} />
        </TabPanel>
        <TabPanel index={2} value={value}>
          <CourseStatistics {...courseStatistics} />
        </TabPanel>
      </Box>
      <NotificationBar notification={courseStatistics.notification} />
    </>
  );
};

StatisticsIndex.propTypes = {
  dispatch: PropTypes.func.isRequired,
  courseStatistics: PropTypes.shape(courseIndexShape),
  studentsStatistics: PropTypes.shape(studentsIndexShape),
  staffStatistics: PropTypes.shape(staffIndexShape),
};

export default connect((state) => ({
  courseStatistics: state.courseStatistics,
  studentsStatistics: state.studentsStatistics,
  staffStatistics: state.staffStatistics,
}))(StatisticsIndex);
