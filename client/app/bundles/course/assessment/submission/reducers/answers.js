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
  current: {},
  clientVersion: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SAVE_GRADE_SUCCESS: {
      const initialValues = buildInitialValues(action.payload.answers);
      const questionId = Object.keys(initialValues)[0];

      return produce(state, (draftState) => {
        const tempDraftState = draftState;
        tempDraftState.initial[questionId] = initialValues[questionId];
        tempDraftState.current[questionId] = initialValues[questionId];
      });
    }
    case actions.SAVE_ANSWER_SUCCESS: {
      const initialValues = buildInitialValues(action.payload.answers);
      const answerId = Object.keys(initialValues)[0];

      const savedClientVersion = action.payload.answers[0].clientVersion;

      return produce(state, (draftState) => {
        const tempDraftState = draftState;
        if (savedClientVersion === state.clientVersion[answerId]) {
          tempDraftState.initial[answerId] = initialValues[answerId];
        } else {
          tempDraftState.initial[answerId] = state.current[answerId];
        }
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
      const clientVersion = action.payload.answers.reduce(
        (obj, answer) => ({
          ...obj,
          [answer.id]: answer.clientVersion,
        }),
        {},
      );
      return produce(state, (draftState) => {
        const tempDraftState = draftState;
        tempDraftState.initial = initialValues;
        tempDraftState.current = initialValues;
        tempDraftState.clientVersion = clientVersion;
      });
    }
    case actions.UPDATE_CURRENT_ANSWER: {
      const currentData = action.data;
      const answerId = action.answerId;

      return produce(state, (draftState) => {
        const tempDraftState = draftState;
        tempDraftState.current[answerId] = currentData[answerId];
        tempDraftState.clientVersion[answerId] = action.clientVersion;
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
