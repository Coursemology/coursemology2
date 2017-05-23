import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'lib/moment';
import history from 'lib/history';
import RaisedButton from 'material-ui/RaisedButton';
import { createResponse } from 'course/survey/actions/responses';

const translations = defineMessages({
  start: {
    id: 'course.surveys.RespondButton.start',
    defaultMessage: 'Start',
  },
  continue: {
    id: 'course.surveys.RespondButton.continue',
    defaultMessage: 'Continue',
  },
  expired: {
    id: 'course.surveys.RespondButton.expired',
    defaultMessage: 'Expired',
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

const RespondButton = ({
  courseId, surveyId, responseId,
  canRespond, canModify, canSubmit,
  startAt, endAt, submittedAt, dispatch,
}) => {
  const isStarted = !!responseId;
  const responsePath = `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`;
  const goToResponseShow = () => history.push(responsePath);
  const goToResponseEdit = () => history.push(`${responsePath}/edit`);
  const goToResponseCreate = () => dispatch(createResponse(surveyId));

  let labelTranslation = translations.notOpen;
  let onTouchTap = () => {};
  let disabled = false;
  let primary = false;

  if (isStarted && (canModify || canSubmit)) {
    labelTranslation = submittedAt ? translations.view : translations.continue;
    onTouchTap = goToResponseEdit;
    primary = !submittedAt;
  } else if (!isStarted && (canRespond || canModify || canSubmit)) {
    labelTranslation = translations.start;
    onTouchTap = goToResponseCreate;
    primary = true;
  } else if (submittedAt) {
    // From this case on, both canModify and canSubmit both false
    labelTranslation = translations.view;
    onTouchTap = canModify ? goToResponseEdit : goToResponseShow;
  } else if (startAt && moment(startAt).isAfter()) {
    disabled = true;
  } else if (endAt && moment(endAt).isBefore()) {
    labelTranslation = translations.expired;
    if (isStarted) {
      onTouchTap = goToResponseShow;
    } else {
      disabled = true;
    }
  }

  return (
    <RaisedButton
      label={<FormattedMessage {...labelTranslation} />}
      {...{ onTouchTap, disabled, primary }}
    />
  );
};

RespondButton.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  surveyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  responseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  canRespond: PropTypes.bool.isRequired,
  canModify: PropTypes.bool.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  startAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  endAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  submittedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),

  dispatch: PropTypes.func.isRequired,
};

RespondButton.defaultProps = {
  responseId: null,
  canRespond: false,
  canModify: false,
  canSubmit: false,
};

export default connect()(RespondButton);
