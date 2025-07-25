import { produce } from 'immer';

import actions from '../constants';
import {
  buildInitialClientVersion,
  convertAnswersDataToInitialValues,
} from '../utils/answers';

const initialState = {
  initial: {},
  clientVersionByAnswerId: {},
  categoryGrades: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SAVE_GRADE_SUCCESS: {
      const initialValues = convertAnswersDataToInitialValues(
        action.payload.answers,
      );
      const answerId = Object.keys(initialValues)[0];
      return produce(state, (draft) => {
        draft.initial[answerId] = initialValues[answerId];
      });
    }
    case actions.SAVE_ANSWER_SUCCESS: {
      const { handleUpdateInitialValue, ...answerValue } = action.payload;
      const answerId = answerValue.id;
      const clientVersionBE = answerValue.clientVersion;
      const clientVersionFE = state.clientVersionByAnswerId[answerId];

      // When both client versions are different, it means that race condition has occurred
      // i.e. FE answer has been updated (yet to be saved due to debouncing) but BE is returning older result
      // As such, keep FE answer and do not update the answer fields until the next autosave is triggered
      if (clientVersionFE !== clientVersionBE) {
        return state;
      }
      handleUpdateInitialValue();
      return produce(state, (draft) => {
        draft.clientVersionByAnswerId[answerId] = clientVersionBE;
      });
    }
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      const answers = action.payload.answers;

      return produce(state, (draft) => {
        draft.initial = convertAnswersDataToInitialValues(answers);

        draft.clientVersionByAnswerId = buildInitialClientVersion(
          action.payload.answers,
        );

        draft.categoryGrades = answers.reduce(
          (previousObj, answer) => ({
            ...previousObj,
            [answer.id]: answer.categoryGrades,
          }),
          {},
        );
      });
    }

    case actions.UPDATE_ANSWER_CLIENT_VERSION: {
      const { clientVersion, id: answerId } = action.payload.answer;

      return produce(state, (draft) => {
        draft.clientVersionByAnswerId[answerId] = clientVersion;
      });
    }
    case actions.UPLOAD_PROGRAMMING_FILES_SUCCESS:
    case actions.DELETE_PROGRAMMING_FILE_SUCCESS:
    case actions.REEVALUATE_SUCCESS:
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS: {
      return state;
    }
    case actions.AUTOGRADE_RUBRIC_SUCCESS:
    case actions.UPDATE_RUBRIC: {
      const { id: answerId, categoryGrades } = action.payload;
      return produce(state, (draft) => {
        draft.categoryGrades[answerId] = categoryGrades;
      });
    }
    default:
      return state;
  }
}
