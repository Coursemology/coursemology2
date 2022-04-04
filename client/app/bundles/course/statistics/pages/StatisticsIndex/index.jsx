import { useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import NotificationBar from 'lib/components/core/NotificationBar';

import { fetchStaffStatistics, fetchStudentsStatistics } from '../../actions';
import { courseIndexShape } from '../../propTypes/course';
import { staffIndexShape } from '../../propTypes/staff';
import { studentsIndexShape } from '../../propTypes/students';

import StaffStatistics from './staff';
import StudentsStatistics from './students';

const translations = defineMessages({
  students: {
    id: 'course.statistics.tabs.students',
    defaultMessage: 'Students',
  },
  staff: {
    id: 'course.statistics.tabs.staff',
    defaultMessage: 'Staff',
  },
  studentsFailure: {
    id: 'course.statistics.failures.students',
    defaultMessage: 'Failed to fetch student data!',
  },
  staffFailure: {
    id: 'course.statistics.failures.staff',
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
      {value === index && (
        <Box sx={{ pt: 3, pb: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
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
  intl,
}) => {
  const [value, setValue] = useState(0);

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
          </Tabs>
        </Box>
        <TabPanel index={0} value={value}>
          <StudentsStatistics {...studentsStatistics} />
        </TabPanel>
        <TabPanel index={1} value={value}>
          <StaffStatistics {...staffStatistics} />
        </TabPanel>
      </Box>
      <NotificationBar notification={courseStatistics.notification} />
    </>
  );
};

StatisticsIndex.propTypes = {
  dispatch: PropTypes.func.isRequired,
  courseStatistics: courseIndexShape.isRequired,
  studentsStatistics: studentsIndexShape.isRequired,
  staffStatistics: staffIndexShape.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect((state) => ({
  courseStatistics: state.courseStatistics,
  studentsStatistics: state.studentsStatistics,
  staffStatistics: state.staffStatistics,
}))(injectIntl(StatisticsIndex));
