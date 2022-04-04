import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import NotificationBar from 'lib/components/NotificationBar';

import StudentsStatistics from './students';
import StaffStatistics from './staff';
import { fetchStudentsStatistics, fetchStaffStatistics } from '../../actions';
import { courseIndexShape } from '../../propTypes/course';
import { studentsIndexShape } from '../../propTypes/students';
import { staffIndexShape } from '../../propTypes/staff';

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
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
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
            value={value}
            onChange={handleChange}
            aria-label="Statistics Index Tabs"
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
        <TabPanel value={value} index={0}>
          <StudentsStatistics {...studentsStatistics} />
        </TabPanel>
        <TabPanel value={value} index={1}>
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
  intl: intlShape,
};

export default connect((state) => ({
  courseStatistics: state.courseStatistics,
  studentsStatistics: state.studentsStatistics,
  staffStatistics: state.staffStatistics,
}))(injectIntl(StatisticsIndex));
