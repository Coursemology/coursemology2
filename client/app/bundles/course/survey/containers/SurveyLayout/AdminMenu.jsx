/* eslint-disable camelcase */
import { useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import MoreVert from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

import * as surveyActions from 'course/survey/actions/surveys';
import { surveyShape } from 'course/survey/propTypes';
import { showDeleteConfirmation } from 'lib/actions';
import { useAppDispatch } from 'lib/hooks/store';

import { formatSurveyFormData } from '../../utils';

const translations = defineMessages({
  editSurvey: {
    id: 'course.survey.SurveyLayout.AdminMenu.editSurvey',
    defaultMessage: 'Edit Survey',
  },
  deleteSurvey: {
    id: 'course.survey.SurveyLayout.AdminMenu.deleteSurvey',
    defaultMessage: 'Delete Survey',
  },
  updateSuccess: {
    id: 'course.survey.SurveyLayout.AdminMenu.updateSuccess',
    defaultMessage: 'Survey "{title}" updated.',
  },
  updateFailure: {
    id: 'course.survey.SurveyLayout.AdminMenu.updateFailure',
    defaultMessage: 'Failed to update survey.',
  },
  deleteSuccess: {
    id: 'course.survey.SurveyLayout.AdminMenu.deleteSuccess',
    defaultMessage: 'Survey "{title}" deleted.',
  },
  deleteFailure: {
    id: 'course.survey.SurveyLayout.AdminMenu.deleteFailure',
    defaultMessage: 'Failed to delete survey.',
  },
});

const AdminMenu = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { intl, survey, surveyId } = props;
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

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

  const updateSurveyHandler = (data, setError) => {
    const { updateSurvey } = surveyActions;

    const payload = formatSurveyFormData(data);
    const successMessage = intl.formatMessage(translations.updateSuccess, data);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(
      updateSurvey(surveyId, payload, successMessage, failureMessage, setError),
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
      bonus_end_at,
      hasStudentResponse,
      has_todo,
      allow_response_after_end,
      allow_modify_after_submit,
      anonymous,
    } = survey;

    const initialValues = {
      title,
      description,
      base_exp,
      time_bonus_exp,
      has_todo,
      allow_response_after_end,
      allow_modify_after_submit,
      anonymous,
      start_at: new Date(start_at),
      end_at: end_at && new Date(end_at),
      bonus_end_at: bonus_end_at && new Date(bonus_end_at),
    };

    return dispatch(
      showSurveyForm({
        onSubmit: updateSurveyHandler,
        formTitle: intl.formatMessage(translations.editSurvey),
        hasStudentResponse,
        initialValues,
      }),
    );
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        disableAutoFocusItem
        id="admin-menu"
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

  intl: PropTypes.object,
};

export default injectIntl(AdminMenu);
