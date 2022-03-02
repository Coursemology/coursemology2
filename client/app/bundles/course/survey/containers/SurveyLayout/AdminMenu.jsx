/* eslint-disable camelcase */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import * as surveyActions from 'course/survey/actions/surveys';
import { showDeleteConfirmation } from 'course/survey/actions';
import { formatSurveyFormData } from 'course/survey/utils';
import { surveyShape } from 'course/survey/propTypes';

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

class AdminMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
    };
  }

  deleteSurveyHandler = () => {
    const { survey, dispatch, intl, surveyId } = this.props;
    const { deleteSurvey } = surveyActions;
    const successMessage = intl.formatMessage(
      translations.deleteSuccess,
      survey,
    );
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () =>
      dispatch(deleteSurvey(surveyId, successMessage, failureMessage));
    return dispatch(showDeleteConfirmation(handleDelete));
  };

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  showEditSurveyForm = () => {
    const { survey, dispatch, intl } = this.props;
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
        onSubmit: this.updateSurveyHandler,
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

  updateSurveyHandler = (data) => {
    const { dispatch, intl, surveyId } = this.props;
    const { updateSurvey } = surveyActions;

    const payload = formatSurveyFormData(data);
    const successMessage = intl.formatMessage(translations.updateSuccess, data);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(
      updateSurvey(surveyId, payload, successMessage, failureMessage),
    );
  };

  render() {
    const { intl, survey } = this.props;
    if (!survey.canUpdate && !survey.canDelete) {
      return null;
    }

    return (
      <>
        <IconButton onClick={this.handleClick}>
          <MoreVert htmlColor="white" />
        </IconButton>
        <Menu
          id="admin-menu"
          anchorEl={this.state.anchorEl}
          disableAutoFocusItem
          onClick={this.handleClose}
          onClose={this.handleClose}
          open={Boolean(this.state.anchorEl)}
        >
          {survey.canUpdate && (
            <MenuItem onClick={this.showEditSurveyForm}>
              {intl.formatMessage(translations.editSurvey)}
            </MenuItem>
          )}
          {survey.canDelete && (
            <MenuItem onClick={this.deleteSurveyHandler}>
              {intl.formatMessage(translations.deleteSurvey)}
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}

AdminMenu.propTypes = {
  survey: surveyShape,
  surveyId: PropTypes.string.isRequired,

  intl: intlShape,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(injectIntl(AdminMenu));
