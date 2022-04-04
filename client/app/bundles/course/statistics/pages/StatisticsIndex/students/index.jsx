import { Box, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { green, orange, red } from '@mui/material/colors';
import { useMemo } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import ErrorCard from 'lib/components/ErrorCard';
import DataTable from 'lib/components/DataTable';
import { studentsIndexShape } from '../../../propTypes/students';

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
  courseCompletion: {
    id: 'course.statistics.student.courseCompletion',
    defaultMessage: 'Course Completion',
  },
  tableTitle: {
    id: 'course.statistics.student.tableTitle',
    defaultMessage: 'Student Submission Statistics',
  },
});

const Circle = ({ value }) => {
  // eslint-disable-next-line no-nested-ternary
  const color = value >= 80 ? green[100] : value >= 40 ? orange[100] : red[100];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Tooltip title={`${value}%`}>
        <div>
          <Box
            component="div"
            width={20}
            height={20}
            borderRadius="50%"
            bgcolor={color}
          />
        </div>
      </Tooltip>
    </div>
  );
};

Circle.propTypes = {
  value: PropTypes.number.isRequired,
};

const StudentsStatistics = ({
  isCourseGamified,
  hasGroupManagers,
  students,
  assessments,
  isFetching,
  isError,
  intl,
}) => {
  if (isFetching || assessments == null) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorCard message={intl.formatMessage(translations.error)} />;
  }

  const mappedStudents = useMemo(
    () =>
      students.map((s) => ({
        ...s,
        courseCompletion:
          assessments.length > 0
            ? Math.round(
                10000 * (s.numAssessmentsCompleted / assessments.length),
              ) / 100
            : 0,
      })),
    [students, assessments],
  );

  const columns = [
    {
      name: 'name',
      label: intl.formatMessage(translations.name),
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          style: {
            position: 'sticky',
            left: 0,
            background: 'white',
            zIndex: 101,
          },
        }),
        setCellHeaderProps: () => ({
          style: {
            position: 'sticky',
            left: 0,
            top: 0, // In case header is fixed
            background: 'white',
            zIndex: 102,
          },
        }),
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
        alignCenter: true,
      },
    });
    columns.push({
      name: 'experiencePoints',
      label: intl.formatMessage(translations.experiencePoints),
      options: {
        filter: false,
        sort: true,
        alignCenter: true,
      },
    });
  }

  columns.push({
    name: 'courseCompletion',
    label: intl.formatMessage(translations.courseCompletion),
    options: {
      filter: true,
      sort: false,
      alignCenter: true,
      customBodyRender: (value) => `${value}%`,
    },
  });

  assessments.forEach((a) => {
    columns.push({
      name: `${a.id}`,
      label: a.title,
      options: {
        sort: true,
        alignCenter: true,
        customBodyRender: (value) => {
          if (value == null) {
            return null;
          }
          return <Circle value={value} />;
        },
      },
    });
  });

  return (
    <DataTable
      title={intl.formatMessage(translations.tableTitle)}
      data={mappedStudents}
      columns={columns}
      options={{
        downloadOptions: {
          filename: intl.formatMessage(translations.tableTitle),
        },
      }}
    />
  );
};

StudentsStatistics.propTypes = studentsIndexShape;

export default injectIntl(StudentsStatistics);
