import { defineMessages, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { createResponse } from 'course/survey/actions/responses';
import { useAppDispatch } from 'lib/hooks/store';
import moment from 'lib/moment';

const translations = defineMessages({
  start: {
    id: 'course.survey.RespondButton.start',
    defaultMessage: 'Start',
  },
  continue: {
    id: 'course.survey.RespondButton.continue',
    defaultMessage: 'Continue',
  },
  expired: {
    id: 'course.survey.RespondButton.expired',
    defaultMessage: 'Expired',
  },
  view: {
    id: 'course.survey.RespondButton.view',
    defaultMessage: 'View',
  },
  notOpen: {
    id: 'course.survey.RespondButton.notOpen',
    defaultMessage: 'Not Open',
  },
});

const RespondButton = ({
  courseId,
  surveyId,
  responseId,
  canRespond,
  canModify,
  canSubmit,
  startAt,
  endAt,
  submittedAt,
}) => {
  const dispatch = useAppDispatch();

  const isStarted = !!responseId;
  const responsePath = `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`;
  const navigate = useNavigate();
  const goToResponseShow = () => navigate(responsePath);
  const goToResponseEdit = () => navigate(`${responsePath}/edit`);
  const goToResponseCreate = () => dispatch(createResponse(surveyId, navigate));

  let labelTranslation = translations.notOpen;
  let onClick = () => {};
  let disabled = false;

  if (isStarted && (canModify || canSubmit)) {
    labelTranslation = submittedAt ? translations.view : translations.continue;
    onClick = goToResponseEdit;
  } else if (!isStarted && (canRespond || canModify || canSubmit)) {
    labelTranslation = translations.start;
    onClick = goToResponseCreate;
  } else if (submittedAt) {
    // From this case on, both canModify and canSubmit both false
    labelTranslation = translations.view;
    onClick = canModify ? goToResponseEdit : goToResponseShow;
  } else if (startAt && moment(startAt).isAfter()) {
    disabled = true;
  } else if (endAt && moment(endAt).isBefore()) {
    labelTranslation = translations.expired;
    if (isStarted) {
      onClick = goToResponseShow;
    } else {
      disabled = true;
    }
  }

  return (
    <Button color="primary" variant="contained" {...{ onClick, disabled }}>
      <FormattedMessage {...labelTranslation} />
    </Button>
  );
};

RespondButton.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  surveyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  responseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  canRespond: PropTypes.bool,
  canModify: PropTypes.bool,
  canSubmit: PropTypes.bool,
  startAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  endAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  submittedAt: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
};

RespondButton.defaultProps = {
  responseId: null,
  canRespond: false,
  canModify: false,
  canSubmit: false,
};

export default RespondButton;
