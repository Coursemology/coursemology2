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

function buildInitialClientVersion(answers) {
  return answers.reduce(
    (obj, answer) => ({
      ...obj,
      [answer.id]: answer.clientVersion,
    }),
    {},
  );
}

const initialState = {
  initial: {},
  clientVersion: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SAVE_GRADE_SUCCESS: {
      const initialValues = buildInitialValues(action.payload.answers);
      const questionId = Object.keys(initialValues)[0];

      return produce(state, (draft) => {
        draft.initial[questionId] = initialValues[questionId];
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
      const clientVersion = buildInitialClientVersion(action.payload.answers);
      return produce(state, (draft) => {
        draft.initial = initialValues;
        draft.clientVersion = clientVersion;
      });
    }
    case actions.UPDATE_CLIENT_VERSION: {
      const clientVersion = action.clientVersion;
      const answerId = action.answerId;

      return produce(state, (draft) => {
        draft.clientVersion[answerId] = clientVersion;
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
