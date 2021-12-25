/* eslint-disable camelcase */
import { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { getStyles } from 'material-ui/AppBar/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PropTypes from 'prop-types';

import { showDeleteConfirmation } from 'course/survey/actions';
import * as surveyActions from 'course/survey/actions/surveys';
import { surveyShape } from 'course/survey/propTypes';
import { formatSurveyFormData } from 'course/survey/utils';

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
    const styles = getStyles(this.props, this.context);

    return (
      <IconMenu
        iconButtonElement={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        iconStyle={styles.iconButtonIconStyle}
      >
        {survey.canUpdate ? (
          <MenuItem
            onClick={this.showEditSurveyForm}
            primaryText={intl.formatMessage(translations.editSurvey)}
          />
        ) : null}
        {survey.canDelete ? (
          <MenuItem
            onClick={this.deleteSurveyHandler}
            primaryText={intl.formatMessage(translations.deleteSurvey)}
          />
        ) : null}
      </IconMenu>
    );
  }
}

AdminMenu.propTypes = {
  survey: surveyShape,
  surveyId: PropTypes.string.isRequired,

  intl: intlShape,
  dispatch: PropTypes.func.isRequired,
};

AdminMenu.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

export default connect()(injectIntl(AdminMenu));
