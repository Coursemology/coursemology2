import { produce } from 'immer';

import actions from '../constants';

// Extract answer values from JSON response
function buildInitialValues(answers) {
  return answers.reduce(
    (obj, answer) => ({
      ...obj,
      [answer.fields.id]: answer.fields,
    }),
    {},
  );
}

const initialState = {
  initial: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SAVE_GRADE_SUCCESS: {
      const initialValues = buildInitialValues(action.payload.answers);
      const questionId = Object.keys(initialValues)[0];

      return produce(state, (draftState) => {
        const tempDraftState = draftState;
        tempDraftState.initial[questionId] = initialValues[questionId];
      });
    }
    case actions.SAVE_ANSWER_SUCCESS: {
      const initialValues = buildInitialValues(action.payload.answers);
      const answerId = Object.keys(initialValues)[0];
      return produce(state, (draftState) => {
        const tempDraftState = draftState;
        tempDraftState.initial[answerId] = initialValues[answerId];
      });
    }
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      const initialValues = buildInitialValues(action.payload.answers);
      return produce(state, (draftState) => {
        const tempDraftState = draftState;
        tempDraftState.initial = initialValues;
      });
    }
    case actions.IMPORT_FILES_SUCCESS:
    case actions.REEVALUATE_SUCCESS:
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS:
    case actions.DELETE_FILE_SUCCESS: {
      return state;
    }
    default:
      return state;
  }
}
