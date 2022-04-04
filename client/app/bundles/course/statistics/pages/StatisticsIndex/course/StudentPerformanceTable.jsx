import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  FormGroup,
  Switch,
  Box,
  LinearProgress,
  Slider,
} from '@mui/material';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { green, red } from '@mui/material/colors';

import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import DataTable from 'lib/components/DataTable';
import { studentShape } from '../../../propTypes/course';

const translations = defineMessages({
  title: {
    id: 'course.statistics.course.studentPerformanceTable.title',
    defaultMessage: 'Student Performance',
  },
  phantom: {
    id: 'course.statistics.course.studentPerformanceTable.phantom',
    defaultMessage: 'Include phantom users',
  },
  highlight: {
    id: 'course.statistics.course.studentPerformanceTable.highlight',
    defaultMessage: 'Highlight top and bottom {percent}%',
  },
  tableTitle: {
    id: 'course.statistics.course.studentPerformanceTable.tableTitle',
    defaultMessage: 'Students Sorted in {direction} {column}',
  },
  asc: {
    id: 'course.statistics.course.studentPerformanceTable.ascending',
    defaultMessage: 'Ascending',
  },
  desc: {
    id: 'course.statistics.course.studentPerformanceTable.descending',
    defaultMessage: 'Descending',
  },
  name: {
    id: 'course.statistics.course.studentPerformanceTable.name',
    defaultMessage: 'Name',
  },
  level: {
    id: 'course.statistics.course.studentPerformanceTable.level',
    defaultMessage: 'Level',
  },
  experiencePoints: {
    id: 'course.statistics.course.studentPerformanceTable.experiencePoints',
    defaultMessage: 'Experience Points',
  },
  learningRate: {
    id: 'course.statistics.course.studentPerformanceTable.learningRate',
    defaultMessage: 'Learning Rate',
  },
  learningRateHint: {
    id: 'course.statistics.course.studentPerformanceTable.learningRateHint',
    defaultMessage:
      'A learning rate of 200% means that they can complete the course in half the time.',
  },
  numSubmissions: {
    id: 'course.statistics.course.studentPerformanceTable.numSubmissions',
    defaultMessage: 'No. of Submissions',
  },
  achievementCount: {
    id: 'course.statistics.course.studentPerformanceTable.achievementCount',
    defaultMessage: 'No. of Achievements',
  },
  correctness: {
    id: 'course.statistics.course.studentPerformanceTable.correctness',
    defaultMessage: 'Correctness',
  },
  videoSubmissionCount: {
    id: 'course.statistics.course.studentPerformanceTable.videoSubmissionCount',
    defaultMessage: 'Video Watch Count',
  },
  videoSubmissionCountHeader: {
    id: 'course.statistics.course.studentPerformanceTable.videoSubmissionCountHeader',
    defaultMessage: 'Videos Watched (Total: {courseVideoCount})',
  },
  videoPercentWatched: {
    id: 'course.statistics.course.studentPerformanceTable.videoPercentWatched',
    defaultMessage: 'Video % Count',
  },
  videoPercentWatchedHeader: {
    id: 'course.statistics.course.studentPerformanceTable.videoPercentWatchedHeader',
    defaultMessage: 'Average Video % Watched',
  },
  noData: {
    id: 'course.statistics.course.studentPerformanceTable.noData',
    defaultMessage: 'No Data',
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

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value ?? 0,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * Value between 0 and 100.
   */
  value: PropTypes.number,
};

const getColumns = (
  hasPersonalizedTimeline,
  isCourseGamified,
  showVideo,
  courseVideoCount,
  intl,
) => {
  const columns = [
    {
      name: 'id',
      label: 'ID',
      options: {
        display: 'excluded',
      },
    },
    {
      name: 'name',
      label: intl.formatMessage(translations.name),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (name, tableMeta) => {
          const id = tableMeta.rowData[0];
          return <a href={getCourseUserURL(getCourseId(), id)}>{name}</a>;
        },
      },
    },
  ];

  if (isCourseGamified) {
    columns.push({
      name: 'level',
      label: intl.formatMessage(translations.level),
      options: {
        filter: true,
        sort: true,
        sortDescFirst: true,
        alignCenter: true,
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
      },
    });
    columns.push({
      name: 'achievementCount',
      label: intl.formatMessage(translations.achievementCount),
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
    label: intl.formatMessage(translations.numSubmissions),
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

  return columns;
};

const StudentPerformanceTable = ({
  students,
  hasPersonalizedTimeline,
  isCourseGamified,
  showVideo,
  courseVideoCount,
  intl,
}) => {
  const [showPhantoms, setShowPhantoms] = useState(false);
  const [sortedColumn, setSortedColumn] = useState('level');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [highlightPercentage, setHighlightPercentage] = useState(5);

  const columns = useMemo(
    () =>
      getColumns(
        hasPersonalizedTimeline,
        isCourseGamified,
        showVideo,
        courseVideoCount,
        intl,
      ),
    [
      hasPersonalizedTimeline,
      isCourseGamified,
      showVideo,
      courseVideoCount,
      intl,
    ],
  );
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
      filter: false,
      print: false,
      viewColumns: false,
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
        filename: title,
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
      title,
    ],
  );

  return (
    <Card style={{ margin: '2rem 0' }} variant="outlined">
      <CardContent>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          fontWeight="bold"
          marginBottom="1rem"
        >
          {intl.formatMessage(translations.title)}
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={showPhantoms}
                onChange={(event) => setShowPhantoms(event.target.checked)}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label={intl.formatMessage(translations.phantom)}
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
              valueLabelDisplay="auto"
              onChange={(_, value) => setHighlightPercentage(value)}
              step={1}
              marks
              min={1}
              max={20}
            />
          </div>
        </FormGroup>
        <DataTable
          title={title}
          data={displayedStudents}
          columns={columns}
          options={options}
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
  intl: intlShape.isRequired,
};

export default injectIntl(StudentPerformanceTable);
