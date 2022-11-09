import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Paper } from '@mui/material';
import PropTypes from 'prop-types';

import { workflowStates } from '../constants';
import { codaveriFeedbackStatusShape } from '../propTypes';

const translations = defineMessages({
  codaveriFeedbackStatus: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.codaveriFeedbackStatus',
    defaultMessage: 'Codaveri Feedback Status',
  },
  loadingFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.loadingFeedbackGeneration',
    defaultMessage: 'Generating Feedback. Please wait.',
  },
  successfulFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.successfulFeedbackGeneration',
    defaultMessage: 'Feedback has been successfully generated.',
  },
  failedFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.failedFeedbackGeneration',
    defaultMessage: 'Failed to generate Feedback. Error: {error}',
  },
});

const CodaveriFeedbackStatus = (props) => {
  const { submissionState, graderView, codaveriFeedbackStatus, intl } = props;
  if (
    !codaveriFeedbackStatus ||
    !graderView ||
    submissionState === workflowStates.Attempting
  )
    return null;

  let feedbackBgColor = 'bg-gray-100';
  let feedbackDescription = '';
  switch (codaveriFeedbackStatus.jobStatus) {
    case 'submitted':
      feedbackBgColor = 'bg-orange-100';
      feedbackDescription = intl.formatMessage(
        translations.loadingFeedbackGeneration,
      );
      break;
    case 'completed':
      feedbackBgColor = 'bg-green-100';
      feedbackDescription = intl.formatMessage(
        translations.successfulFeedbackGeneration,
      );
      break;
    case 'errored':
      feedbackBgColor = 'bg-red-100';
      feedbackDescription = intl.formatMessage(
        translations.failedFeedbackGeneration,
        { error: codaveriFeedbackStatus.errorMessage },
      );
      break;
    default:
      break;
  }

  return (
    <Paper className="mb-8">
      <div className={`${feedbackBgColor} inline-block p-8 font-bold`}>
        {intl.formatMessage(translations.codaveriFeedbackStatus)}
      </div>
      <div className="inline-block pl-5">{feedbackDescription}</div>
    </Paper>
  );
};

CodaveriFeedbackStatus.propTypes = {
  submissionState: PropTypes.string,
  graderView: PropTypes.bool,
  codaveriFeedbackStatus: codaveriFeedbackStatusShape,
  intl: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const { answerId, intl } = ownProps;

  return {
    submissionState: state.submission.workflowState,
    graderView: state.submission.graderView,
    codaveriFeedbackStatus: state.codaveriFeedbackStatus.answers[answerId],
    ...intl,
  };
}

export default connect(mapStateToProps)(injectIntl(CodaveriFeedbackStatus));
