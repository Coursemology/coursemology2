import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { aWeekStartingTomorrow } from 'lib/date-time-defaults';
import { showSurveyForm, createSurvey } from 'course/survey/actions/surveys';
import AddButton from 'course/survey/components/AddButton';

const translations = defineMessages({
  newSurvey: {
    id: 'course.surveys.NewSurveyButton.title',
    defaultMessage: 'New Survey',
  },
  success: {
    id: 'course.surveys.NewSurveyButton.success',
    defaultMessage: 'Survey "{title}" created.',
  },
  failure: {
    id: 'course.surveys.NewSurveyButton.failure',
    defaultMessage: 'Failed to create survey.',
  },
});

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  canCreate: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

class NewSurveyButton extends React.Component {
  createSurveyHandler = (data) => {
    const { dispatch, intl } = this.props;

    const payload = { survey: data };
    const successMessage = intl.formatMessage(translations.success, data);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(createSurvey(payload, successMessage, failureMessage));
  }

  showNewSurveyForm = () => {
    const { dispatch, intl } = this.props;

    return dispatch(showSurveyForm({
      onSubmit: this.createSurveyHandler,
      formTitle: intl.formatMessage(translations.newSurvey),
      initialValues: Object.assign({ base_exp: 0 }, aWeekStartingTomorrow()),
    }));
  }

  render() {
    const { canCreate } = this.props;
    return canCreate ? <AddButton onTouchTap={this.showNewSurveyForm} /> : <div />;
  }
}

NewSurveyButton.propTypes = propTypes;

export default connect(state => state.surveysFlags)(injectIntl(NewSurveyButton));
