import { useMemo } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { PURPLE_CHART_BACKGROUND, PURPLE_CHART_BORDER } from 'theme/colors';

import ViolinChart from 'lib/components/core/charts/ViolinChart';

import { submissionRecordsShape } from '../../propTypes';

const translations = defineMessages({
  yAxisLabel: {
    id: 'course.assessment.statistics.gradeViolin.yAxisLabel',
    defaultMessage: 'Submissions',
  },
  xAxisLabel: {
    id: 'course.assessment.statistics.gradeViolin.xAxisLabel',
    defaultMessage: 'Grades',
  },
  datasetLabel: {
    id: 'course.assessment.statistics.gradeViolin.datasetLabel',
    defaultMessage: 'Distribution',
  },
});

const styles = {
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

const DEFAULT_OPTIONS = {
  indexAxis: 'y',
  responsive: true,
  legend: {
    position: 'top',
  },
};

const GradeViolinChart = ({ submissions, intl }) => {
  const grades =
    submissions?.filter((s) => s.grade != null)?.map((s) => s.grade) ?? [];

  const data = {
    labels: [intl.formatMessage(translations.yAxisLabel)],
    datasets: [
      {
        label: intl.formatMessage(translations.datasetLabel),
        backgroundColor: PURPLE_CHART_BACKGROUND,
        borderColor: PURPLE_CHART_BORDER,
        borderWidth: 1,
        data: [grades],
      },
    ],
  };

  const options = useMemo(
    () => ({
      ...DEFAULT_OPTIONS,
      scales: {
        x: {
          title: {
            display: true,
            text: intl.formatMessage(translations.xAxisLabel),
          },
        },
      },
    }),
    [intl],
  );

  return (
    <div style={styles.root}>
      <ViolinChart data={data} options={options} />
    </div>
  );
};

GradeViolinChart.propTypes = {
  submissions: PropTypes.arrayOf(submissionRecordsShape).isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(GradeViolinChart);
