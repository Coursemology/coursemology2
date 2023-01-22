import { memo, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  FormGroup,
  Slider,
  Switch,
  Typography,
} from '@mui/material';
import { green, red } from '@mui/material/colors';
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';

import DataTable from 'lib/components/core/layouts/DataTable';
import LinearProgressWithLabel from 'lib/components/core/LinearProgressWithLabel';
import Link from 'lib/components/core/Link';

import { studentShape } from '../../../propTypes/course';

const translations = defineMessages({
  title: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.title',
    defaultMessage: 'Student Performance',
  },
  includePhantom: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.phantom',
    defaultMessage: 'Include phantom users',
  },
  highlight: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.highlight',
    defaultMessage: 'Highlight top and bottom {percent}%',
  },
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.tableTitle',
    defaultMessage: 'Students Sorted in {direction} {column}',
  },
  asc: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.ascending',
    defaultMessage: 'Ascending',
  },
  desc: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.descending',
    defaultMessage: 'Descending',
  },
  name: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.name',
    defaultMessage: 'Name',
  },
  studentType: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.studentType',
    defaultMessage: 'Student Type',
  },
  normal: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.studentType.normal',
    defaultMessage: 'Normal',
  },
  phantom: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.studentType.phantom',
    defaultMessage: 'Phantom',
  },
  groupManagers: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.groupManagers',
    defaultMessage: 'Tutors',
  },
  level: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.level',
    defaultMessage: 'Level (Max: {maxLevel})',
  },
  experiencePoints: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.experiencePoints',
    defaultMessage: 'Experience Points',
  },
  learningRate: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.learningRate',
    defaultMessage: 'Learning Rate',
  },
  learningRateHint: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.learningRateHint',
    defaultMessage:
      'A learning rate of 200% means that they can complete the course in half the time.',
  },
  numSubmissions: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.numSubmissions',
    defaultMessage: 'No. of Submissions (Total: {courseAssessmentCount})',
  },
  achievementCount: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.achievementCount',
    defaultMessage: 'No. of Achievements (Total: {courseAchievementCount})',
  },
  correctness: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.correctness',
    defaultMessage: 'Correctness',
  },
  correctnessHint: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.correctnessHint',
    defaultMessage:
      'Correctness is the average grade percentage of all graded assessments by a student.',
  },
  videoSubmissionCountHeader: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.videoSubmissionCountHeader',
    defaultMessage: 'Videos Watched (Total: {courseVideoCount})',
  },
  videoPercentWatched: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.videoPercentWatched',
    defaultMessage: 'Video % Count',
  },
  videoPercentWatchedHeader: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.videoPercentWatchedHeader',
    defaultMessage: 'Average Video % Watched',
  },
  noData: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.noData',
    defaultMessage: 'No Data',
  },
  levelFilter: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.levelFilter',
    defaultMessage: 'Level: {name}',
  },
  tutorFilter: {
    id: 'course.statistics.StatisticsIndex.course.StudentPerformanceTable.tutorFilter',
    defaultMessage: 'Tutor: {name}',
  },
});

const styles = {
  sliderRoot: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '500px',
    minWidth: '300px',
    flexWrap: 'no-wrap',
    flex: 1,
    marginBottom: '5px',
  },
  sliderDescription: {
    marginRight: '2rem',
    whiteSpace: 'pre',
  },
};

const StudentPerformanceTable = ({
  students,
  hasPersonalizedTimeline,
  isCourseGamified,
  showVideo,
  courseVideoCount,
  courseAchievementCount,
  courseAssessmentCount,
  maxLevel,
  hasGroupManagers,
}) => {
  const intl = useIntl();
  const [showPhantoms, setShowPhantoms] = useState(false);
  const [sortedColumn, setSortedColumn] = useState('experiencePoints');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [highlightPercentage, setHighlightPercentage] = useState(5);

  const displayedStudents = useMemo(
    () => students.filter((s) => showPhantoms || !s.isPhantom),
    [students, showPhantoms],
  );

  const length = useMemo(() => displayedStudents.length, [displayedStudents]);

  const title = useMemo(
    () =>
      intl.formatMessage(translations.tableTitle, {
        direction: intl.formatMessage(translations[sortDirection]),
        column: intl.formatMessage(translations[sortedColumn]),
      }),
    [intl, sortDirection, sortedColumn],
  );

  const options = useMemo(
    () => ({
      filter: true,
      jumpToPage: true,
      print: false,
      viewColumns: false,
      selectableRows: 'none',
      onColumnSortChange: (column, direction) => {
        setSortedColumn(column);
        setSortDirection(direction);
      },
      onChangePage: (currentPage) => setPage(currentPage),
      onChangeRowsPerPage: (numberOfRows) => {
        setRowsPerPage(numberOfRows);
        if (numberOfRows * page > length) {
          setPage(Math.floor(length / numberOfRows));
        }
      },
      sortOrder: {
        name: sortedColumn,
        direction: sortDirection,
      },
      setRowProps: (_row, _dataIndex, rowIndex) => {
        const highlightRange = Math.floor((length * highlightPercentage) / 100);
        const index = page * rowsPerPage + rowIndex;
        if (index <= highlightRange) {
          return {
            style: {
              backgroundColor: sortDirection === 'desc' ? green[50] : red[50],
            },
          };
        }
        if (index >= length - highlightRange) {
          return {
            style: {
              backgroundColor: sortDirection === 'desc' ? red[50] : green[50],
            },
          };
        }
        return {};
      },
      downloadOptions: {
        filename: 'student_performance_statistics',
      },
    }),
    [
      setSortedColumn,
      setSortDirection,
      setPage,
      setRowsPerPage,
      sortedColumn,
      sortDirection,
      page,
      rowsPerPage,
      highlightPercentage,
      length,
    ],
  );

  const columns = [
    {
      name: 'name',
      label: intl.formatMessage(translations.name),
      options: {
        filter: false,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const student = displayedStudents[dataIndex];
          return (
            <Link key={student.id} href={student.nameLink} opensInNewTab>
              {student.name}
            </Link>
          );
        },
      },
    },
    {
      name: 'isPhantom',
      label: intl.formatMessage(translations.studentType),
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) =>
          displayedStudents[dataIndex].isPhantom
            ? intl.formatMessage(translations.phantom)
            : intl.formatMessage(translations.normal),
      },
    },
  ];

  if (hasGroupManagers) {
    columns.push({
      name: 'groupManagers',
      label: intl.formatMessage(translations.groupManagers),
      options: {
        filter: true,
        filterType: 'multiselect',
        filterOptions: {
          names: [
            ...new Set(
              students.flatMap((s) => s.groupManagers.map((m) => m.name)),
            ),
          ],
          logic: (managers, filters) => {
            if (filters) {
              const filterSet = new Set(filters);
              return !managers
                .map((m) => m.name)
                .some((name) => filterSet.has(name));
            }
            return false;
          },
          fullWidth: true,
        },
        customFilterListOptions: {
          render: (name) =>
            intl.formatMessage(translations.tutorFilter, { name }),
        },
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const groupManagers = displayedStudents[dataIndex].groupManagers;
          if (!groupManagers) {
            return '';
          }
          return (
            <>
              {groupManagers.map((m, index) => (
                <span key={m.id}>
                  <Link href={m.nameLink} opensInNewTab>
                    {m.name}
                  </Link>
                  {index < groupManagers.length - 1 && ', '}
                </span>
              ))}
            </>
          );
        },
      },
    });
  }

  if (isCourseGamified) {
    columns.push({
      name: 'level',
      label: intl.formatMessage(translations.level, { maxLevel }),
      options: {
        filter: true,
        sort: true,
        sortDescFirst: true,
        alignCenter: true,
        filterType: 'multiselect',
        filterOptions: {
          fullWidth: true,
        },
        customFilterListOptions: {
          render: (name) =>
            intl.formatMessage(translations.levelFilter, { name }),
        },
      },
    });
    columns.push({
      name: 'experiencePoints',
      label: intl.formatMessage(translations.experiencePoints),
      options: {
        filter: false,
        sort: true,
        sortDescFirst: true,
        alignCenter: true,
        customBodyRenderLite: (dataIndex) => {
          const student = displayedStudents[dataIndex];
          return (
            <Link
              key={student.id}
              href={student.experiencePointsLink}
              opensInNewTab
            >
              {student.experiencePoints}
            </Link>
          );
        },
      },
    });
    columns.push({
      name: 'achievementCount',
      label: intl.formatMessage(translations.achievementCount, {
        courseAchievementCount,
      }),
      options: {
        filter: false,
        sort: true,
        sortDescFirst: true,
        alignCenter: true,
      },
    });
  }

  columns.push({
    name: 'numSubmissions',
    label: intl.formatMessage(translations.numSubmissions, {
      courseAssessmentCount,
    }),
    options: {
      filter: false,
      sort: true,
      sortDescFirst: true,
      alignCenter: true,
    },
  });
  columns.push({
    name: 'correctness',
    label: intl.formatMessage(translations.correctness),
    options: {
      filter: false,
      sort: true,
      sortDescFirst: true,
      hint: intl.formatMessage(translations.correctnessHint),
      customBodyRender: (value) =>
        value != null ? `${value}%` : intl.formatMessage(translations.noData),
      alignCenter: true,
    },
  });

  if (hasPersonalizedTimeline) {
    columns.push({
      name: 'learningRate',
      label: intl.formatMessage(translations.learningRate),
      options: {
        filter: false,
        sort: true,
        sortDescFirst: true,
        hint: intl.formatMessage(translations.learningRateHint),
        customBodyRender: (value) =>
          value != null ? `${value}%` : intl.formatMessage(translations.noData),
        alignCenter: true,
      },
    });
  }

  if (showVideo) {
    columns.push({
      name: 'videoSubmissionCount',
      label: intl.formatMessage(translations.videoSubmissionCountHeader, {
        courseVideoCount,
      }),
      options: {
        filter: false,
        sort: true,
        alignCenter: true,
        sortDescFirst: true,
        customBodyRenderLite: (dataIndex) => {
          const student = displayedStudents[dataIndex];
          return (
            <Link
              key={student.id}
              href={student.videoSubmissionLink}
              opensInNewTab
            >
              {student.videoSubmissionCount}
            </Link>
          );
        },
      },
    });
    columns.push({
      name: 'videoPercentWatched',
      label: intl.formatMessage(translations.videoPercentWatchedHeader),
      options: {
        filter: false,
        sort: true,
        sortDescFirst: true,
        customBodyRender: (value) => (
          <Box sx={{ width: '100%' }}>
            <LinearProgressWithLabel value={value} />
          </Box>
        ),
      },
    });
  }

  return (
    <Card style={{ margin: '2rem 0' }} variant="outlined">
      <CardContent>
        <Typography
          component="div"
          fontWeight="bold"
          gutterBottom
          marginBottom="1rem"
          variant="h6"
        >
          {intl.formatMessage(translations.title)}
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={showPhantoms}
                inputProps={{ 'aria-label': 'controlled' }}
                onChange={(event) => setShowPhantoms(event.target.checked)}
              />
            }
            label={intl.formatMessage(translations.includePhantom)}
          />
          <div style={styles.sliderRoot}>
            <span style={styles.sliderDescription}>
              {intl.formatMessage(translations.highlight, {
                percent: highlightPercentage,
              })}
            </span>
            <Slider
              aria-label="Highlight Percentage"
              defaultValue={highlightPercentage}
              getAriaValueText={(value) => `${value}%`}
              marks
              max={20}
              min={1}
              onChange={(_, value) => setHighlightPercentage(value)}
              step={1}
              valueLabelDisplay="auto"
            />
          </div>
        </FormGroup>
        <DataTable
          columns={columns}
          data={displayedStudents}
          options={options}
          title={title}
        />
      </CardContent>
    </Card>
  );
};

StudentPerformanceTable.propTypes = {
  students: PropTypes.arrayOf(studentShape),
  hasPersonalizedTimeline: PropTypes.bool.isRequired,
  isCourseGamified: PropTypes.bool.isRequired,
  showVideo: PropTypes.bool.isRequired,
  courseVideoCount: PropTypes.number.isRequired,
  courseAssessmentCount: PropTypes.number.isRequired,
  courseAchievementCount: PropTypes.number.isRequired,
  maxLevel: PropTypes.number.isRequired,
  hasGroupManagers: PropTypes.bool.isRequired,
};

export default memo(StudentPerformanceTable, equal);
