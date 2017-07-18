import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFormValues } from 'redux-form';

import { getScribingId } from 'lib/helpers/url-helpers';
import ScribingQuestionForm from './containers/ScribingQuestionForm';
import * as scribingQuestionActionCreators from './actions/scribingQuestionActionCreators';
import { formNames } from './constants';
import { questionShape } from './propTypes';


function buildInitialValues(scribingQuestion) {
  return scribingQuestion.question ?
  {
    question_scribing: {
      title: scribingQuestion.question.title,
      description: scribingQuestion.question.description,
      staff_only_comments: scribingQuestion.question.staff_only_comments,
      maximum_grade: scribingQuestion.question.maximum_grade || undefined,
      skill_ids: scribingQuestion.question.skill_ids,
    },
  } : {};
}

function mapStateToProps({ scribingQuestion, ...state }) {
  return {
    ...state,
    scribingQuestion,
    initialValues: buildInitialValues(scribingQuestion),
    formValues: getFormValues(formNames.SCRIBING_QUESTION)(state),
    scribingId: getScribingId(),
  };
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  scribingQuestion: PropTypes.shape({
    question: questionShape,
    is_loading: PropTypes.bool,
  }).isRequired,
  formValues: PropTypes.shape({
    question_scribing: PropTypes.shape(questionShape),
  }),
  initialValues: PropTypes.object,
  scribingId: PropTypes.string,
};


const ScribingQuestion = (props) => {
  const { dispatch, scribingQuestion, formValues, initialValues, scribingId } = props;
  const actions = bindActionCreators(scribingQuestionActionCreators, dispatch);

  return (
    <ScribingQuestionForm
      actions={actions}
      data={scribingQuestion}
      formValues={formValues}
      initialValues={initialValues}
      scribingId={scribingId}
    />
  );
};

ScribingQuestion.propTypes = propTypes;

export default connect(mapStateToProps)(ScribingQuestion);
