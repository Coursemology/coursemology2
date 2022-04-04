import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import {
  Card,
  CardContent,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from '@mui/material';
import {
  GREEN_CHART_BACKGROUND,
  GREEN_CHART_BORDER,
  ORANGE_CHART_BORDER,
  RED_CHART_BORDER,
} from 'theme/colors';
import GeneralChart from 'lib/components/charts/GeneralChart';
import {
  computeLimits,
  footerRenderer,
  labelRenderer,
  processSubmissionsIntoChartData,
  titleRenderer,
} from './utils';
import { assessmentShape, submissionShape } from '../../../propTypes/course';

const translations = defineMessages({
  title: {
    id: 'course.statistics.course.studentProgressionChart.title',
    defaultMessage: 'Student Progression',
  },
  latestSubmission: {
    id: 'course.statistics.course.studentProgressionChart.latestSubmission',
    defaultMessage: 'Latest Submission',
  },
  studentSubmissions: {
    id: 'course.statistics.course.studentProgressionChart.studentSubmissions',
    defaultMessage: "{name}'s Submissions",
  },
  deadlines: {
    id: 'course.statistics.course.studentProgressionChart.deadlines',
    defaultMessage: 'Deadlines',
  },
  openingTimes: {
    id: 'course.statistics.course.studentProgressionChart.openingTimes',
    defaultMessage: 'Opening Times',
  },
  showOpeningTimes: {
    id: 'course.statistics.course.studentProgressionChart.showOpeningTimes',
    defaultMessage: 'Show opening times of assessments',
  },
  phantom: {
    id: 'course.statistics.course.studentProgressionChart.phantom',
    defaultMessage: 'Include phantom users',
  },
  yAxisLabel: {
    id: 'course.statistics.course.studentProgressionChart.yAxisLabel',
    defaultMessage: 'Assessment (Sorted by Deadline)',
  },
  xAxisLabel: {
    id: 'course.statistics.course.studentProgressionChart.xAxisLabel',
    defaultMessage: 'Date',
  },
  note: {
    id: 'course.statistics.course.studentProgressionChart.note',
    defaultMessage:
      'Note: The chart above only shows assessments with deadlines. Students may also have personalized deadlines.',
  },
});

const chartGlobalOptions = (intl) => ({
  scales: {
    x: {
      type: 'time',
      time: {
        tooltipFormat: 'YYYY-MM-DD h:mm:ss a',
      },
      title: {
        display: true,
        text: intl.formatMessage(translations.xAxisLabel),
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: intl.formatMessage(translations.yAxisLabel),
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        title: titleRenderer,
        label: labelRenderer(intl),
        footer: footerRenderer(intl),
      },
    },
  },
});

const StudentProgressionChart = ({ assessments, submissions, intl }) => {
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [showOpeningTimes, setShowOpeningTimes] = useState(true);
  const [showPhantoms, setShowPhantoms] = useState(false);

  const onClick = useCallback(
    (_, elements) => {
      const relevantPoints = elements.filter((e) => e.datasetIndex === 0);
      if (relevantPoints.length !== 1) {
        return;
      }
      setSelectedStudentIndex(relevantPoints[0].index);
    },
    [setSelectedStudentIndex],
  );

  const studentData = useMemo(
    () =>
      processSubmissionsIntoChartData(assessments, submissions, showPhantoms),
    [assessments, submissions, showPhantoms],
  );

  const limits = useMemo(
    () => computeLimits(assessments, submissions),
    [assessments, submissions],
  );

  const data = useMemo(
    () => ({
      datasets: [
        // All students
        {
          type: 'scatter',
          label: intl.formatMessage(translations.latestSubmission),
          data: studentData.map((s) => {
            const latestPoint = s.submissions[s.submissions.length - 1];
            return {
              x: latestPoint.submittedAt,
              y: s.submissions.length - 1,
              name: s.name,
              title: assessments[latestPoint.key].title,
            };
          }),
          backgroundColor: RED_CHART_BORDER,
        },

        // Selected student
        ...(selectedStudentIndex
          ? [
              {
                type: 'line',
                label: intl.formatMessage(translations.studentSubmissions, {
                  name: studentData[selectedStudentIndex].name,
                }),
                data: studentData[selectedStudentIndex].submissions.map(
                  (s, index) => ({
                    x: s?.submittedAt,
                    y: index,
                    name: studentData[selectedStudentIndex].name,
                    title: assessments[index].title,
                  }),
                ),
                spanGaps: true,
                backgroundColor: ORANGE_CHART_BORDER,
                borderColor: ORANGE_CHART_BORDER,
              },
            ]
          : []),

        // Deadlines
        {
          type: 'line',
          label: intl.formatMessage(translations.deadlines),
          data: assessments.map((a, index) => ({
            x: a.endAt,
            y: index,
            title: a.title,
            isStartAt: false,
          })),
          backgroundColor: GREEN_CHART_BORDER,
          borderColor: GREEN_CHART_BORDER,
          fill: false,
        },

        // Opening times
        ...(showOpeningTimes
          ? [
              {
                type: 'line',
                label: intl.formatMessage(translations.openingTimes),
                data: assessments.map((a, index) => ({
                  x: a.startAt,
                  y: index,
                  title: a.title,
                  isStartAt: true,
                })),
                backgroundColor: GREEN_CHART_BORDER,
                borderColor: GREEN_CHART_BORDER,
                fill: {
                  target: '-1', // fill until deadline dataset
                  above: GREEN_CHART_BACKGROUND,
                  below: GREEN_CHART_BACKGROUND,
                },
              },
            ]
          : []),
      ],
    }),
    [assessments, studentData, selectedStudentIndex, showOpeningTimes, intl],
  );

  const options = useMemo(
    () => ({
      ...chartGlobalOptions(intl),
      onClick,
    }),
    [onClick, intl],
  );

  return (
    <Card variant="outlined">
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
        <div>
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch
                  checked={showOpeningTimes}
                  onChange={(event) =>
                    setShowOpeningTimes(event.target.checked)
                  }
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
              label={intl.formatMessage(translations.showOpeningTimes)}
            />
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
          </FormGroup>
        </div>
        <GeneralChart
          type="scatter"
          withZoom
          limits={limits}
          options={options}
          data={data}
        />
        <Typography textAlign="center" variant="subtitle1" fontSize="1.4rem">
          {intl.formatMessage(translations.note)}
        </Typography>
      </CardContent>
    </Card>
  );
};

StudentProgressionChart.propTypes = {
  assessments: PropTypes.arrayOf(assessmentShape),
  submissions: PropTypes.arrayOf(submissionShape),
  intl: intlShape.isRequired,
};

export default injectIntl(StudentProgressionChart);
