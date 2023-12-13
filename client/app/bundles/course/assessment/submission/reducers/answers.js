import { produce } from 'immer';

import actions from '../constants';

function setAnswerFields(answer) {
  switch (answer.questionType) {
    case 'TextResponse':
    case 'FileUpload':
    case 'Comprehension':
      return { ...answer.fields, files: null };
    case 'Programming':
      return { ...answer.fields, import_files: null };
    default:
      return answer.fields;
  }
}

// Extract answer values from JSON response
function buildInitialValues(answers) {
  return answers.reduce(
    (obj, answer) => ({
      ...obj,
      [answer.fields.id]: setAnswerFields(answer),
    }),
    {},
  );
}

function extendAnswer(questions, answers) {
  const mapAnswerToQuestionType = questions.reduce(
    (obj, question) => ({
      ...obj,
      [question.id]: question.type,
    }),
    {},
  );
  return answers.map((answer) => ({
    ...answer,
    questionType: mapAnswerToQuestionType[answer.questionId],
  }));
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
      const answers = extendAnswer(
        action.payload.questions,
        action.payload.answers,
      );
      const initialValues = buildInitialValues(answers);
      const answerId = Object.keys(initialValues)[0];

      return produce(state, (draft) => {
        draft.initial[answerId] = initialValues[answerId];
      });
    }
    case actions.SAVE_ANSWER_SUCCESS: {
      const answers = extendAnswer(
        action.payload.questions,
        action.payload.answers,
      );
      const initialValues = buildInitialValues(answers);
      const answerId = Object.keys(initialValues)[0];

      const savedClientVersion = action.payload.answers[0].clientVersion;

      if (state.clientVersion[answerId] !== savedClientVersion) {
        return state;
      }

      return produce(state, (draft) => {
        draft.initial[answerId] = initialValues[answerId];
        draft.clientVersion[answerId] = savedClientVersion;
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
      const answers = extendAnswer(
        action.payload.questions,
        action.payload.answers,
      );
      const initialValues = buildInitialValues(answers);
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
