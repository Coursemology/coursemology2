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
    defaultMessage: 'Generating Feedback. Please wait...',
  },
  successfulFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.successfulFeedbackGeneration',
    defaultMessage: 'Feedback has been successfully generated.',
  },
  failedFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.failedFeedbackGeneration',
    defaultMessage: 'Failed to generate feedback. Please try again later.',
  },
});

const codaveriJobDisplay = {
  submitted: {
    feedbackBgColor: 'bg-orange-100',
    feedbackDescription: translations.loadingFeedbackGeneration,
  },
  completed: {
    feedbackBgColor: 'bg-green-100',
    feedbackDescription: translations.successfulFeedbackGeneration,
  },
  errored: {
    feedbackBgColor: 'bg-red-100',
    feedbackDescription: translations.failedFeedbackGeneration,
  },
};

const CodaveriFeedbackStatus = (props) => {
  const { submissionState, graderView, codaveriFeedbackStatus, intl } = props;
  if (
    !codaveriFeedbackStatus ||
    !graderView ||
    submissionState === workflowStates.Attempting
  )
    return null;

  const { feedbackBgColor, feedbackDescription } =
    codaveriJobDisplay[codaveriFeedbackStatus.jobStatus];

  return (
    <Paper className="mb-8">
      <div className={`${feedbackBgColor} table-cell p-8 font-bold`}>
        {intl.formatMessage(translations.codaveriFeedbackStatus)}
      </div>
      <div className="table-cell pl-5">
        {intl.formatMessage(feedbackDescription)}
      </div>
    </Paper>
  );
};

CodaveriFeedbackStatus.propTypes = {
  submissionState: PropTypes.string,
  graderView: PropTypes.bool,
  codaveriFeedbackStatus: codaveriFeedbackStatusShape,
  intl: PropTypes.object,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { answerId, intl } = ownProps;

  return {
    submissionState: submission.submission.workflowState,
    graderView: submission.submission.graderView,
    codaveriFeedbackStatus: submission.codaveriFeedbackStatus.answers[answerId],
    ...intl,
  };
}

export default connect(mapStateToProps)(injectIntl(CodaveriFeedbackStatus));
