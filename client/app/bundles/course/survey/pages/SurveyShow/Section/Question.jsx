import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';

import { showDeleteConfirmation } from 'course/survey/actions';
import { formatQuestionFormData } from 'course/survey/utils';
import { questionShape } from 'course/survey/propTypes';
import * as questionActions from 'course/survey/actions/questions';
import QuestionCard from './QuestionCard';

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

class Question extends Component {
  deleteQuestionHandler = () => {
    const { dispatch, question, intl } = this.props;
    const { deleteSurveyQuestion } = questionActions;

    const successMessage = intl.formatMessage(translations.deleteSuccess);
    const failureMessage = intl.formatMessage(translations.deleteFailure);
    const handleDelete = () =>
      dispatch(deleteSurveyQuestion(question, successMessage, failureMessage));
    return dispatch(showDeleteConfirmation(handleDelete));
  };

  showEditQuestionForm = () => {
    const { dispatch, intl, question } = this.props;
    const { showQuestionForm } = questionActions;

    return dispatch(
      showQuestionForm({
        onSubmit: this.updateQuestionHandler,
        formTitle: intl.formatMessage(translations.editQuestion),
        initialValues: {
          ...question,
          question_type: question.question_type.toString(),
          optionsToDelete: [],
        },
      }),
    );
  };

  updateQuestionHandler = (data, setError) => {
    const { dispatch, intl } = this.props;
    const { updateSurveyQuestion } = questionActions;

    const payload = formatQuestionFormData(data);
    const successMessage = intl.formatMessage(translations.updateSuccess);
    const failureMessage = intl.formatMessage(translations.updateFailure);
    return dispatch(
      updateSurveyQuestion(
        data.id,
        payload,
        successMessage,
        failureMessage,
        setError,
      ),
    );
  };

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
    const { question, expanded, index } = this.props;

    return (
      <Draggable draggableId={`question-${question.id}`} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            className="mb-5"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <QuestionCard
              {...{ question, expanded }}
              adminFunctions={this.adminFunctions()}
            />
          </div>
        )}
      </Draggable>
    );
  }
}

Question.propTypes = {
  question: questionShape,
  expanded: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect()(injectIntl(Question));
