import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';

import * as questionActions from 'course/survey/actions/questions';
import { questionShape } from 'course/survey/propTypes';
import { formatQuestionFormData } from 'course/survey/utils';
import { showDeleteConfirmation } from 'lib/actions';

import QuestionCard from './QuestionCard';

const translations = defineMessages({
  editQuestion: {
    id: 'course.survey.SurveyShow.Question.editQuestion',
    defaultMessage: 'Edit Question',
  },
  updateSuccess: {
    id: 'course.survey.SurveyShow.Question.updateSuccess',
    defaultMessage: 'Question updated.',
  },
  updateFailure: {
    id: 'course.survey.SurveyShow.Question.updateFailure',
    defaultMessage: 'Failed to update question.',
  },
  deleteQuestion: {
    id: 'course.survey.SurveyShow.Question.deleteQuestion',
    defaultMessage: 'Delete Question',
  },
  deleteSuccess: {
    id: 'course.survey.SurveyShow.Question.deleteSuccess',
    defaultMessage: 'Question deleted.',
  },
  deleteFailure: {
    id: 'course.survey.SurveyShow.Question.deleteFailure',
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
    const { question, dragging, expanded, index } = this.props;

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
              {...{ question, dragging, expanded }}
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
  dragging: PropTypes.bool,
  expanded: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect()(injectIntl(Question));
