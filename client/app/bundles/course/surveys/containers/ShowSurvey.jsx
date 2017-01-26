import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import * as actionCreators from '../actions';
import SurveyDetails from '../components/SurveyDetails';

const translations = defineMessages({
  editSurvey: {
    id: 'course.surveys.Survey.editSurvey',
    defaultMessage: 'Edit Survey',
  },
  updateSuccess: {
    id: 'course.surveys.Survey.updateSuccess',
    defaultMessage: 'Survey "{title}" updated.',
  },
  updateFailure: {
    id: 'course.surveys.Survey.updateFailure',
    defaultMessage: 'Failed to update survey.',
  },
});

class ShowSurvey extends React.Component {
  constructor(props) {
    super(props);

    this.updateSurveyHandler = this.updateSurveyHandler.bind(this);
    this.showEditSurveyForm = this.showEditSurveyForm.bind(this);
  }

  componentDidMount() {
    const {
      dispatch,
      params: { courseId, surveyId },
    } = this.props;
    dispatch(actionCreators.fetchSurvey(courseId, surveyId));
  }

  updateSurveyHandler(data) {
    const { dispatch, intl, params: { courseId, surveyId } } = this.props;
    const { updateSurvey } = actionCreators;

    const payload = { survey: data };
    const successMessage = intl.formatMessage(translations.updateSuccess, data);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(updateSurvey(courseId, surveyId, payload, successMessage, failureMessage));
  }

  showEditSurveyForm(survey) {
    const { dispatch, intl } = this.props;
    const { showSurveyForm } = actionCreators;
    const { start_at, end_at, ...surveyFields } = survey;

    return () => dispatch(showSurveyForm({
      onSubmit: this.updateSurveyHandler,
      formTitle: intl.formatMessage(translations.editSurvey),
      initialValues: {
        start_at: new Date(start_at),
        end_at: new Date(end_at),
        ...surveyFields,
      },
    }));
  }

  adminFunctions(survey) {
    const { intl } = this.props;
    const functions = [];

    if (survey.canUpdate) {
      functions.push({
        label: intl.formatMessage(translations.editSurvey),
        handler: this.showEditSurveyForm(survey),
      });
    }

    return functions;
  }

  render() {
    const { surveys, params: { surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};
    return (
      <SurveyDetails
        {...{ survey }}
        adminFunctions={this.adminFunctions(survey)}
      />
    );
  }
}

ShowSurvey.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
    surveyId: PropTypes.string.isRequired,
  }).isRequired,
  surveys: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(state => state)(injectIntl(ShowSurvey));
