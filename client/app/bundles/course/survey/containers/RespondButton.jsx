import React, { PropTypes } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'lib/moment';
import { browserHistory } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { surveyShape } from '../propTypes';
import { createResponse } from '../actions/responses';

const translations = defineMessages({
  start: {
    id: 'course.surveys.RespondButton.start',
    defaultMessage: 'Start',
  },
  continue: {
    id: 'course.surveys.RespondButton.continue',
    defaultMessage: 'Continue',
  },
  view: {
    id: 'course.surveys.RespondButton.view',
    defaultMessage: 'View',
  },
  notOpen: {
    id: 'course.surveys.RespondButton.notOpen',
    defaultMessage: 'Not Open',
  },
});

const RespondButton = ({ dispatch, survey, courseId }) => {
  const {
    id,
    isStarted,
    canUpdate,
    responseId,
    start_at: startAt,
    submitted_at: submittedAt,
  } = survey;
  const notYetOpen = !canUpdate && moment(startAt).isAfter();
  const goToResponse = () => browserHistory.push(
    `/courses/${courseId}/surveys/${id}/responses/${responseId}`
  );

  let labelTranslation = translations.start;
  let onTouchTap = () => dispatch(createResponse(id));
  if (notYetOpen) {
    labelTranslation = translations.notOpen;
    onTouchTap = () => {};
  } else if (submittedAt) {
    labelTranslation = translations.view;
    onTouchTap = goToResponse;
  } else if (isStarted) {
    labelTranslation = translations.continue;
    onTouchTap = goToResponse;
  }

  return (
    <RaisedButton
      label={<FormattedMessage {...labelTranslation} />}
      disabled={notYetOpen}
      primary={!notYetOpen && !submittedAt}
      {...{ onTouchTap }}
    />
  );
};

RespondButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  survey: surveyShape,
  courseId: PropTypes.string.isRequired,
};

export default connect()(RespondButton);
