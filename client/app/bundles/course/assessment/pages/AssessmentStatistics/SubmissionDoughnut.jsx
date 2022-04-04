import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  GREEN_CHART_BACKGROUND,
  GREEN_CHART_BORDER,
  ORANGE_CHART_BACKGROUND,
  ORANGE_CHART_BORDER,
  RED_CHART_BACKGROUND,
  RED_CHART_BORDER,
} from 'theme/colors';

import DoughnutChart from 'lib/components/core/charts/DoughnutChart';

import { courseUserShape, submissionRecordsShape } from '../../propTypes';

const translations = defineMessages({
  datasetLabel: {
    id: 'course.assessment.statistics.submissionDoughnut.datasetLabel',
    defaultMessage: 'Student Submission Statuses',
  },
  submitted: {
    id: 'course.assessment.statistics.submissionDoughnut.submitted',
    defaultMessage: 'Submitted',
  },
  attempting: {
    id: 'course.assessment.statistics.submissionDoughnut.attempting',
    defaultMessage: 'Attempting',
  },
  unattempted: {
    id: 'course.assessment.statistics.submissionDoughnut.unattempted',
    defaultMessage: 'Unattempted',
  },
});

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

const SubmissionDoughnut = ({ submissions, allStudents, intl }) => {
  const numSubmitted = submissions.filter((s) => s.submittedAt != null).length;
  const numAttempting = submissions.length - numSubmitted;
  const numUnattempted = allStudents.length - submissions.length;

  const data = {
    labels: [
      intl.formatMessage(translations.submitted),
      intl.formatMessage(translations.attempting),
      intl.formatMessage(translations.unattempted),
    ],
    datasets: [
      {
        label: intl.formatMessage(translations.datasetLabel),
        data: [numSubmitted, numAttempting, numUnattempted],
        backgroundColor: [
          GREEN_CHART_BACKGROUND,
          ORANGE_CHART_BACKGROUND,
          RED_CHART_BACKGROUND,
        ],
        borderColor: [
          GREEN_CHART_BORDER,
          ORANGE_CHART_BORDER,
          RED_CHART_BORDER,
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={styles.root}>
      <DoughnutChart data={data} />
    </div>
  );
};

SubmissionDoughnut.propTypes = {
  submissions: PropTypes.arrayOf(submissionRecordsShape).isRequired,
  allStudents: PropTypes.arrayOf(courseUserShape).isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(SubmissionDoughnut);
