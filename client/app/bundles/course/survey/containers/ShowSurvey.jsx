import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { showDeleteConfirmation } from '../actions';
import * as surveyActions from '../actions/surveys';
import SurveyDetails from '../components/SurveyDetails';
import SurveyQuestions from '../components/SurveyQuestions';
import NewQuestionButton from '../containers/NewQuestionButton';

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
  deleteSurvey: {
    id: 'course.surveys.Survey.deleteSurvey',
    defaultMessage: 'Delete Survey',
  },
  deleteSuccess: {
    id: 'course.surveys.Survey.deleteSuccess',
    defaultMessage: 'Survey "{title}" deleted.',
  },
  deleteFailure: {
    id: 'course.surveys.Survey.deleteFailure',
    defaultMessage: 'Failed to delete survey.',
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
    dispatch(surveyActions.fetchSurvey(courseId, surveyId));
  }

  updateSurveyHandler(data) {
    const { dispatch, intl, params: { courseId, surveyId } } = this.props;
    const { updateSurvey } = surveyActions;

    const payload = { survey: data };
    const successMessage = intl.formatMessage(translations.updateSuccess, data);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(updateSurvey(courseId, surveyId, payload, successMessage, failureMessage));
  }

  showEditSurveyForm(survey) {
    const { dispatch, intl } = this.props;
    const { showSurveyForm } = surveyActions;
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

  deleteSurveyHandler(survey) {
    const { dispatch, intl, params: { courseId, surveyId } } = this.props;
    const { deleteSurvey } = surveyActions;

    const successMessage = intl.formatMessage(translations.deleteSuccess, survey);
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () => (
      dispatch(deleteSurvey(courseId, surveyId, successMessage, failureMessage))
    );
    return () => dispatch(showDeleteConfirmation(handleDelete));
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

    if (survey.canDelete) {
      functions.push({
        label: intl.formatMessage(translations.deleteSurvey),
        handler: this.deleteSurveyHandler(survey),
      });
    }

    return functions;
  }

  render() {
    const { surveys, params: { courseId, surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};

    return (
      <div>
        <SurveyDetails
          {...{ survey, courseId }}
          adminFunctions={this.adminFunctions(survey)}
        />
        <SurveyQuestions questions={survey.questions} />
        <NewQuestionButton {...{ courseId, surveyId }} />
      </div>
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
  intl: intlShape.isRequired,
};

export default connect(state => state)(injectIntl(ShowSurvey));
