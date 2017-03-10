import React, { PropTypes } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { showDeleteConfirmation } from '../../../actions';
import { formatQuestionFormData } from '../../../utils';
import { questionShape } from '../../../propTypes';
import QuestionCard from './QuestionCard';
import * as questionActions from '../../../actions/questions';

const translations = defineMessages({
  editQuestion: {
    id: 'course.surveys.Question.editQuestion',
    defaultMessage: 'Edit Question',
  },
  updateSuccess: {
    id: 'course.surveys.Question.updateSuccess',
    defaultMessage: 'Question updated.',
  },
  updateFailure: {
    id: 'course.surveys.Question.updateFailure',
    defaultMessage: 'Failed to update question.',
  },
  deleteQuestion: {
    id: 'course.surveys.Question.deleteQuestion',
    defaultMessage: 'Delete Question',
  },
  deleteSuccess: {
    id: 'course.surveys.Question.deleteSuccess',
    defaultMessage: 'Question deleted.',
  },
  deleteFailure: {
    id: 'course.surveys.Question.deleteFailure',
    defaultMessage: 'Failed to delete question.',
  },
});

class Question extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    question: questionShape,
    expanded: PropTypes.bool.isRequired,
  };

  updateQuestionHandler = (data) => {
    const { dispatch, intl } = this.props;
    const { updateSurveyQuestion } = questionActions;

    const payload = formatQuestionFormData(data);
    const successMessage = intl.formatMessage(translations.updateSuccess);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(
      updateSurveyQuestion(data.id, payload, successMessage, failureMessage)
    );
  }

  showEditQuestionForm = () => {
    const { dispatch, intl, question } = this.props;
    const { showQuestionForm } = questionActions;

    return dispatch(showQuestionForm({
      onSubmit: this.updateQuestionHandler,
      formTitle: intl.formatMessage(translations.editQuestion),
      initialValues: {
        ...question,
        question_type: question.question_type.toString(),
      },
    }));
  }

  deleteQuestionHandler = () => {
    const { dispatch, question, intl } = this.props;
    const { deleteSurveyQuestion } = questionActions;

    const successMessage = intl.formatMessage(translations.deleteSuccess);
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () => dispatch(
      deleteSurveyQuestion(question, successMessage, failureMessage)
    );
    return dispatch(showDeleteConfirmation(handleDelete));
  }

  // TODO handle permissions
  adminFunctions() {
    const { intl, question } = this.props;
    const functions = [];

    if (question.canUpdate) {
      functions.push({
        label: intl.formatMessage(translations.editQuestion),
        handler: this.showEditQuestionForm,
      });
    }

    if (question.canDelete) {
      functions.push({
        label: intl.formatMessage(translations.deleteQuestion),
        handler: this.deleteQuestionHandler,
      });
    }

    return functions;
  }

  render() {
    const { question, expanded } = this.props;
    return (
      <QuestionCard
        {...{ question, expanded }}
        adminFunctions={this.adminFunctions()}
      />
    );
  }
}

export default connect(state => state)(injectIntl(Question));
