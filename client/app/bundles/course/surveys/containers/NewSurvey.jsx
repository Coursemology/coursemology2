import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { aWeekStartingTomorrow } from 'lib/date_time_defaults';
import * as actionCreators from '../actions';
import AddButton from '../components/AddButton';
import SurveyFormDialogue from '../containers/SurveyFormDialogue';

const translations = defineMessages({
  newSurvey: {
    id: 'course.surveys.NewSurvey.title',
    defaultMessage: 'New Survey',
  },
  success: {
    id: 'course.surveys.NewSurvey.success',
    defaultMessage: 'Survey "{title}" created.',
  },
  failure: {
    id: 'course.surveys.NewSurvey.failure',
    defaultMessage: 'Failed to create survey.',
  },
});

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  createPath: PropTypes.string,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class NewSurvey extends React.Component {
  constructor(props) {
    super(props);

    this.createSurveyHandler = this.createSurveyHandler.bind(this);
  }

  createSurveyHandler(data) {
    const { dispatch, intl, createPath } = this.props;
    const { createSurvey } = actionCreators;

    const payload = { survey: data };
    const successMessage = intl.formatMessage(translations.success, data);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(createSurvey(createPath, payload, successMessage, failureMessage));
  }

  render() {
    const { dispatch, intl, createPath } = this.props;
    const { showSurveyForm } = actionCreators;

    if (!createPath) {
      return <div />;
    }

    return (
      <div>
        <AddButton onTouchTap={() => { dispatch(showSurveyForm()); }} />
        <SurveyFormDialogue
          onSubmit={this.createSurveyHandler}
          formTitle={intl.formatMessage(translations.newSurvey)}
          initialValues={Object.assign({ base_exp: 0 }, aWeekStartingTomorrow())}
        />
      </div>
    );
  }
}

NewSurvey.propTypes = propTypes;

export default connect(state => state)(injectIntl(NewSurvey));
