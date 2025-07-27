import actions from '../constants';

function initQuestionStateFromAnswerPayload(answer) {
  const lastAutograding = answer.autogradings?.at(-1);
  if (lastAutograding) {
    return {
      canReadTests: answer.canReadTests,
      testCases: lastAutograding.testCases,
      testResults: lastAutograding.testResults,
      stdout: lastAutograding.stdout,
      stderr: lastAutograding.stderr,
    };
  }
  return { testCases: answer.testCases };
}

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        ...action.payload.answers.reduce(
          (obj, answer) => ({
            ...obj,
            [answer.questionId]: initQuestionStateFromAnswerPayload(answer),
          }),
          {},
        ),
      };
    case actions.SAVE_ANSWER_SUCCESS:
    case actions.REEVALUATE_SUCCESS:
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS: {
      const { questionId } = action.payload;
      return Object.keys(state).reduce(
        (obj, key) => {
          if (key !== questionId.toString()) {
            return { ...obj, [key]: state[key] };
          }
          return obj;
        },
        { [questionId]: initQuestionStateFromAnswerPayload(action.payload) },
      );
    }
    case actions.REEVALUATE_FAILURE:
    case actions.AUTOGRADE_FAILURE: {
      // Clear the previous test results in the test case results display.
      const { questionId } = action;

      const questionState = {};
      // For each test case in each test type, add back the data without the output
      // and passed values.
      if (state[questionId]) {
        Object.keys(state[questionId]).forEach((key) => {
          if (key !== 'testResults') {
            questionState[key] = state[questionId][key];
          }
        });
      }

      return {
        ...state,
        [questionId]: questionState,
      };
    }
    default:
      return state;
  }
}
