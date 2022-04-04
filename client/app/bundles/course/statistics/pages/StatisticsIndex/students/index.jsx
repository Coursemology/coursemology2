import { defineMessages, injectIntl } from 'react-intl';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import ErrorCard from 'lib/components/core/ErrorCard';
import DataTable from 'lib/components/core/layouts/DataTable';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import { studentsIndexShape } from '../../../propTypes/students';

const options = {
  filterType: 'multiselect',
  downloadOptions: {
    filename: 'students',
  },
};

const translations = defineMessages({
  error: {
    id: 'course.statistics.student.error',
    defaultMessage:
      'Something went wrong when fetching student statistics! Please refresh to try again.',
  },
  name: {
    id: 'course.statistics.student.name',
    defaultMessage: 'Name',
  },
  groupManagers: {
    id: 'course.statistics.student.groupManagers',
    defaultMessage: 'Tutors',
  },
  level: {
    id: 'course.statistics.student.level',
    defaultMessage: 'Level',
  },
  experiencePoints: {
    id: 'course.statistics.student.experiencePoints',
    defaultMessage: 'Experience Points',
  },
  videoSubmissionCount: {
    id: 'course.statistics.student.videoSubmissionCount',
    defaultMessage: 'Videos Watched (Total: {courseVideoCount})',
  },
  videoPercentWatched: {
    id: 'course.statistics.student.videoPercentWatched',
    defaultMessage: 'Average % Watched',
  },
  tableTitle: {
    id: 'course.statistics.student.tableTitle',
    defaultMessage: 'Student Statistics',
  },
});

const LinearProgressWithLabel = (props) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box sx={{ width: '100%', mr: 1 }}>
      <LinearProgress variant="determinate" {...props} />
    </Box>
    <Box sx={{ minWidth: 35 }}>
      <Typography color="text.secondary" variant="body2">{`${Math.round(
        props.value ?? 0,
      )}%`}</Typography>
    </Box>
  </Box>
);

LinearProgressWithLabel.propTypes = {
  /**
   * Value between 0 and 100.
   */
  value: PropTypes.number,
};

const StudentsStatistics = ({
  isCourseGamified,
  showVideo,
  courseVideoCount,
  hasGroupManagers,
  students,
  isFetching,
  isError,
  intl,
}) => {
  if (isFetching) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorCard message={intl.formatMessage(translations.error)} />;
  }

  const columns = [
    {
      name: 'name',
      label: intl.formatMessage(translations.name),
      options: {
        filter: false,
        sort: true,
      },
    },
  ];
  if (hasGroupManagers) {
    columns.push({
      name: 'groupManagers',
      label: intl.formatMessage(translations.groupManagers),
      options: {
        filter: true,
        sort: true,
      },
    });
  }
  if (isCourseGamified) {
    columns.push({
      name: 'level',
      label: intl.formatMessage(translations.level),
      options: {
        filter: true,
        sort: true,
      },
    });
    columns.push({
      name: 'experiencePoints',
      label: intl.formatMessage(translations.experiencePoints),
      options: {
        filter: false,
        sort: true,
      },
    });
  }
  if (showVideo) {
    columns.push({
      name: 'videoSubmissionCount',
      label: intl.formatMessage(translations.videoSubmissionCount, {
        courseVideoCount,
      }),
    });
    columns.push({
      name: 'videoPercentWatched',
      label: intl.formatMessage(translations.videoPercentWatched),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => (
          <Box sx={{ width: '100%' }}>
            <LinearProgressWithLabel value={value} />
          </Box>
        ),
      },
    });
  }

  return (
    <DataTable
      columns={columns}
      data={students}
      options={options}
      title={intl.formatMessage(translations.tableTitle)}
    />
  );
};

StudentsStatistics.propTypes = studentsIndexShape;

export default injectIntl(StudentsStatistics);
