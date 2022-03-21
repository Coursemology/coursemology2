/* eslint-disable camelcase */
import { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
import * as surveyActions from 'course/survey/actions/surveys';
import { showDeleteConfirmation } from 'course/survey/actions';
import { formatSurveyFormData } from 'course/survey/utils';
import { surveyShape } from 'course/survey/propTypes';
import { useNavigate } from 'react-router-dom';

const translations = defineMessages({
  editSurvey: {
    id: 'course.surveys.SurveyLayout.AdminMenu.editSurvey',
    defaultMessage: 'Edit Survey',
  },
  deleteSurvey: {
    id: 'course.surveys.SurveyLayout.AdminMenu.deleteSurvey',
    defaultMessage: 'Delete Survey',
  },
  updateSuccess: {
    id: 'course.surveys.SurveyLayout.AdminMenu.updateSuccess',
    defaultMessage: 'Survey "{title}" updated.',
  },
  updateFailure: {
    id: 'course.surveys.SurveyLayout.AdminMenu.updateFailure',
    defaultMessage: 'Failed to update survey.',
  },
  deleteSuccess: {
    id: 'course.surveys.SurveyLayout.AdminMenu.deleteSuccess',
    defaultMessage: 'Survey "{title}" deleted.',
  },
  deleteFailure: {
    id: 'course.surveys.SurveyLayout.AdminMenu.deleteFailure',
    defaultMessage: 'Failed to delete survey.',
  },
});

const AdminMenu = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { dispatch, intl, survey, surveyId } = props;
  const navigate = useNavigate();

  if (!survey.canUpdate && !survey.canDelete) {
    return null;
  }

  const deleteSurveyHandler = () => {
    const { deleteSurvey } = surveyActions;
    const successMessage = intl.formatMessage(
      translations.deleteSuccess,
      survey,
    );
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () =>
      dispatch(
        deleteSurvey(surveyId, successMessage, failureMessage, navigate),
      );
    return dispatch(showDeleteConfirmation(handleDelete));
  };

  const handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateSurveyHandler = (data) => {
    const { updateSurvey } = surveyActions;

    const payload = formatSurveyFormData(data);
    const successMessage = intl.formatMessage(translations.updateSuccess, data);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(
      updateSurvey(surveyId, payload, successMessage, failureMessage),
    );
  };

  const showEditSurveyForm = () => {
    const { showSurveyForm } = surveyActions;
    const {
      title,
      description,
      base_exp,
      time_bonus_exp,
      start_at,
      end_at,
      hasStudentResponse,
      allow_response_after_end,
      allow_modify_after_submit,
      anonymous,
    } = survey;

    const initialValues = {
      title,
      description,
      base_exp,
      time_bonus_exp,
      allow_response_after_end,
      allow_modify_after_submit,
      anonymous,
    };

    return dispatch(
      showSurveyForm({
        onSubmit: updateSurveyHandler,
        formTitle: intl.formatMessage(translations.editSurvey),
        hasStudentResponse,
        initialValues: {
          ...initialValues,
          start_at: new Date(start_at),
          end_at: end_at && new Date(end_at),
        },
      }),
    );
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVert htmlColor="white" />
      </IconButton>
      <Menu
        id="admin-menu"
        anchorEl={anchorEl}
        disableAutoFocusItem
        onClick={handleClose}
        onClose={handleClose}
        open={Boolean(anchorEl)}
      >
        {survey.canUpdate && (
          <MenuItem onClick={showEditSurveyForm}>
            {intl.formatMessage(translations.editSurvey)}
          </MenuItem>
        )}
        {survey.canDelete && (
          <MenuItem onClick={deleteSurveyHandler}>
            {intl.formatMessage(translations.deleteSurvey)}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

AdminMenu.propTypes = {
  survey: surveyShape,
  surveyId: PropTypes.string.isRequired,

  intl: intlShape,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(injectIntl(AdminMenu));
