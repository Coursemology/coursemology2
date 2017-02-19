import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { sorts } from '../utils';
import { showDeleteConfirmation } from '../actions';
import surveyTranslations from '../translations';
import * as surveyActions from '../actions/surveys';
import SurveyDetails from '../containers/SurveyDetails';
import NewQuestionButton from '../containers/NewQuestionButton';
import ShowQuestion from '../containers/ShowQuestion';

const translations = defineMessages({
  editSurvey: {
    id: 'course.surveys.Survey.editSurvey',
    defaultMessage: 'Edit Survey',
  },
  deleteSurvey: {
    id: 'course.surveys.Survey.deleteSurvey',
    defaultMessage: 'Delete Survey',
  },
  empty: {
    id: 'course.surveys.Survey.empty',
    defaultMessage: 'This survey does not have any questions.',
  },
});

class ShowSurvey extends React.Component {
  componentDidMount() {
    const {
      dispatch,
      params: { courseId, surveyId },
    } = this.props;
    dispatch(surveyActions.fetchSurvey(courseId, surveyId));
  }

  updateSurveyHandler = (data) => {
    const { dispatch, intl, params: { courseId, surveyId } } = this.props;
    const { updateSurvey } = surveyActions;

    const payload = { survey: data };
    const successMessage = intl.formatMessage(surveyTranslations.updateSuccess, data);
    const failureMessage = intl.formatMessage(surveyTranslations.updateFailure);
    return dispatch(updateSurvey(courseId, surveyId, payload, successMessage, failureMessage));
  }

  showEditSurveyForm = (survey) => {
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

    const successMessage = intl.formatMessage(surveyTranslations.deleteSuccess, survey);
    const failureMessage = intl.formatMessage(surveyTranslations.deleteFailure);
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

  renderQuestions(survey) {
    const { intl, params } = this.props;
    const { questions, canUpdate } = survey;
    const { byWeight } = sorts;

    if (!canUpdate) {
      return null;
    }

    if (!questions || questions.length < 1) {
      return <Subheader>{ intl.formatMessage(translations.empty) }</Subheader>;
    }

    return (
      <div>
        <Subheader>{ intl.formatMessage(surveyTranslations.questions) }</Subheader>
        {questions.sort(byWeight).map(question =>
          <ShowQuestion key={question.id} {...{ question, params }} />
        )}
      </div>
    );
  }

  render() {
    const { surveys, params: { courseId, surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};
    return (
      <div>
        <SurveyDetails
          {...{ survey, courseId, surveyId }}
          adminFunctions={this.adminFunctions(survey)}
        />
        { this.renderQuestions(survey) }
        { survey.canCreateQuestion ? <NewQuestionButton {...{ courseId, surveyId }} /> : null }
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
