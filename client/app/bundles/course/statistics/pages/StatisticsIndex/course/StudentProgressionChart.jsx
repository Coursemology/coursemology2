import { memo, useCallback, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Card,
  CardContent,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from '@mui/material';
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';
import {
  GREEN_CHART_BACKGROUND,
  GREEN_CHART_BORDER,
  ORANGE_CHART_BORDER,
  RED_CHART_BORDER,
} from 'theme/colors';

import {
  processAssessment,
  processSubmissions,
} from 'course/statistics/utils/parseCourseResponse';
import GeneralChart from 'lib/components/core/charts/GeneralChart';
import useTranslation from 'lib/hooks/useTranslation';

import { assessmentShape, submissionShape } from '../../../propTypes/course';

import {
  computeLimits,
  footerRenderer,
  labelRenderer,
  processSubmissionsIntoChartData,
  titleRenderer,
} from './utils';

const translations = defineMessages({
  title: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.title',
    defaultMessage: 'Student Progression',
  },
  latestSubmission: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.latestSubmission',
    defaultMessage: 'Latest Submission',
  },
  studentSubmissions: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.studentSubmissions',
    defaultMessage: "{name}'s Submissions",
  },
  deadlines: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.deadlines',
    defaultMessage: 'Deadlines',
  },
  openingTimes: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.openingTimes',
    defaultMessage: 'Opening Times',
  },
  showOpeningTimes: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.showOpeningTimes',
    defaultMessage: 'Show opening times of assessments',
  },
  phantom: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.phantom',
    defaultMessage: 'Include phantom users',
  },
  yAxisLabel: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.yAxisLabel',
    defaultMessage: 'Assessment (Sorted by Deadline)',
  },
  xAxisLabel: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.xAxisLabel',
    defaultMessage: 'Date',
  },
  note: {
    id: 'course.statistics.StatisticsIndex.course.StudentProgressionChart.note',
    defaultMessage:
      'Note: The chart above only shows assessments with deadlines. Students may also have personalized deadlines.',
  },
});

const chartGlobalOptions = (t) => ({
  scales: {
    x: {
      type: 'time',
      time: {
        tooltipFormat: 'YYYY-MM-DD h:mm:ss a',
      },
      title: {
        display: true,
        text: t(translations.xAxisLabel),
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: t(translations.yAxisLabel),
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        title: titleRenderer,
        label: labelRenderer(t),
        footer: footerRenderer(t),
      },
    },
  },
});

const StudentProgressionChart = ({ assessments, submissions }) => {
  const { t } = useTranslation();
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [showOpeningTimes, setShowOpeningTimes] = useState(true);
  const [showPhantoms, setShowPhantoms] = useState(false);

  const formattedAssessments = assessments.map(processAssessment);
  const formattedSubmissions = submissions.map(processSubmissions);

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
      processSubmissionsIntoChartData(
        formattedAssessments,
        formattedSubmissions,
        showPhantoms,
      ),
    [formattedAssessments, formattedSubmissions, showPhantoms],
  );

  const limits = useMemo(
    () => computeLimits(formattedAssessments, formattedSubmissions),
    [formattedAssessments, formattedSubmissions],
  );

  const data = useMemo(
    () => ({
      datasets: [
        // All students
        {
          type: 'scatter',
          label: t(translations.latestSubmission),
          data: studentData.map((s) => {
            const latestPoint = s.submissions[s.submissions.length - 1];
            return {
              x: latestPoint.submittedAt,
              y: s.submissions.length - 1,
              name: s.name,
              title: formattedAssessments[latestPoint.key].title,
            };
          }),
          backgroundColor: RED_CHART_BORDER,
        },

        // Selected student
        ...(selectedStudentIndex
          ? [
              {
                type: 'line',
                label: t(translations.studentSubmissions, {
                  name: studentData[selectedStudentIndex].name,
                }),
                data: studentData[selectedStudentIndex].submissions.map(
                  (s, index) => ({
                    x: s?.submittedAt,
                    y: index,
                    name: studentData[selectedStudentIndex].name,
                    title: formattedAssessments[index].title,
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
          label: t(translations.deadlines),
          data: formattedAssessments.map((a, index) => ({
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
                label: t(translations.openingTimes),
                data: formattedAssessments.map((a, index) => ({
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
    [
      formattedAssessments,
      studentData,
      selectedStudentIndex,
      showOpeningTimes,
      t,
    ],
  );

  const options = useMemo(
    () => ({
      ...chartGlobalOptions(t),
      onClick,
    }),
    [onClick, t],
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          component="div"
          fontWeight="bold"
          gutterBottom
          marginBottom="1rem"
          variant="h6"
        >
          {t(translations.title)}
        </Typography>
        <div>
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch
                  checked={showOpeningTimes}
                  inputProps={{ 'aria-label': 'controlled' }}
                  onChange={(event) =>
                    setShowOpeningTimes(event.target.checked)
                  }
                />
              }
              label={t(translations.showOpeningTimes)}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showPhantoms}
                  inputProps={{ 'aria-label': 'controlled' }}
                  onChange={(event) => setShowPhantoms(event.target.checked)}
                />
              }
              label={t(translations.phantom)}
            />
          </FormGroup>
        </div>
        <GeneralChart
          data={data}
          limits={limits}
          options={options}
          type="scatter"
          withZoom={studentData.length > 0}
        />
        <Typography fontSize="1.4rem" textAlign="center" variant="subtitle1">
          {t(translations.note)}
        </Typography>
      </CardContent>
    </Card>
  );
};

StudentProgressionChart.propTypes = {
  assessments: PropTypes.arrayOf(assessmentShape),
  submissions: PropTypes.arrayOf(submissionShape),
};

export default memo(StudentProgressionChart, equal);
