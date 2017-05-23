/* eslint-disable new-cap */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import { showDeleteConfirmation } from 'course/survey/actions';
import { formatQuestionFormData } from 'course/survey/utils';
import { questionShape } from 'course/survey/propTypes';
import { draggableTypes } from 'course/survey/constants';
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
  reorderSuccess: {
    id: 'course.surveys.Question.reorderSuccess',
    defaultMessage: 'Question moved.',
  },
  reorderFailure: {
    id: 'course.surveys.Question.reorderFailure',
    defaultMessage: 'Failed to move question.',
  },
});

class Question extends React.Component {
  static propTypes = {
    question: questionShape,
    expanded: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
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
    const { question, expanded, isDragging, connectDragSource, connectDropTarget } = this.props;
    const opacity = isDragging ? 0.2 : 1;
    return connectDropTarget(connectDragSource(
      <div style={{ opacity }} ref={(node) => { this.DOMNode = node; }}>
        <QuestionCard
          {...{ question, expanded }}
          adminFunctions={this.adminFunctions()}
        />
      </div>
    ));
  }
}

const questionSource = {
  isDragging(props, monitor) {
    return monitor.getItem().id === props.question.id;
  },

  beginDrag(props) {
    props.dispatch(questionActions.setDraggedQuestion(
      props.index,
      props.sectionIndex,
      props.question.section_id
    ));

    return { id: props.question.id };
  },

  endDrag(props) {
    const successMessage = props.intl.formatMessage(translations.reorderSuccess);
    const failureMessage = props.intl.formatMessage(translations.reorderFailure);
    props.dispatch(questionActions.finalizeOrder(successMessage, failureMessage));
  },
};

const questionTarget = {
  /**
   * Handles reordering of question within section
   */
  hover(props, monitor, component) {
    const sourceId = monitor.getItem().id;
    const {
      index: sourceIndex,
      sectionIndex: sourceSectionIndex,
      sectionId: sourceSectionId,
    } = props.draggedQuestion;
    const hoverIndex = props.index;
    const hoverId = props.question.id;
    const hoverSectionId = props.question.section_id;

    // Do not replace question cards with themselves
    if (sourceId === hoverId) { return; }

    // Do not handle questions cards from other sections
    if (sourceSectionId !== hoverSectionId) { return; }

    // Only perform the move when source question has been dragged past half of the target question
    const hoverBoundingRect = component.decoratedComponentInstance.DOMNode.getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom + hoverBoundingRect.top) / 2;
    const pointerY = monitor.getClientOffset().y;
    const draggedUpwardPastMidLine = sourceIndex > hoverIndex && pointerY < hoverMiddleY;
    const draggedDownwardPastMidLine = sourceIndex < hoverIndex && pointerY > hoverMiddleY;
    if (draggedUpwardPastMidLine || draggedDownwardPastMidLine) {
      props.dispatch(questionActions.reorder(
        sourceSectionIndex,
        sourceIndex,
        hoverIndex
      ));
    }
  },
};

function targetCollect(connector) {
  return {
    connectDropTarget: connector.dropTarget(),
  };
}

function sourceCollect(connector, monitor) {
  return {
    connectDragSource: connector.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

// TODO By default, React DnD takes a screenshot of the element being dragged using the HTML5
// backend. However, any overlapping elements also appears in the screenshot. To fix this.
export default connect()(
  injectIntl(
    DropTarget(draggableTypes.QUESTION, questionTarget, targetCollect)(
      DragSource(draggableTypes.QUESTION, questionSource, sourceCollect)(
        Question
      )
    )
  )
);
