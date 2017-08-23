import { reducer as formReducer } from 'redux-form';

import actions, { formNames } from '../constants';

// Extract redux-form values from JSON response
function buildInitialValues(answers) {
  return answers.reduce((obj, answer) => ({
    ...obj,
    [answer.fields.id]: answer.fields,
  }), {});
}

// Return a new state slice with the new answer replacing its
// previous answer of the same question
function updateAnswerInState(state, answer) {
  const { questionId, fields: { id } } = answer;
  return Object.keys(state).reduce((obj, key) => {
    if (state[key].questionId !== questionId) {
      return { ...obj, [key]: state[key] };
    }
    return obj;
  }, { [id]: answer.fields });
}

export default formReducer.plugin({
  [formNames.SUBMISSION]: (state, action) => {
    switch (action.type) {
      case actions.FETCH_SUBMISSION_SUCCESS:
      case actions.SAVE_DRAFT_SUCCESS:
      case actions.FINALISE_SUCCESS:
      case actions.UNSUBMIT_SUCCESS:
      case actions.SAVE_GRADE_SUCCESS:
      case actions.MARK_SUCCESS:
      case actions.UNMARK_SUCCESS:
      case actions.PUBLISH_SUCCESS: {
        const formValues = buildInitialValues(action.payload.answers);

        return {
          ...state,
          initial: formValues,
          values: formValues,
        };
      }
      case actions.AUTOGRADE_SUCCESS:
      case actions.RESET_SUCCESS: {
        const answer = action.payload;

        return {
          ...state,
          initial: updateAnswerInState(state.initial, answer),
          values: updateAnswerInState(state.values, answer),
        };
      }
      default:
        return state;
    }
  },
});
