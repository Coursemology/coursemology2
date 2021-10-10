import actions from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        ...action.payload.answers.reduce(
          (obj, answer) => ({ ...obj, [answer.questionId]: answer.testCases }),
          {},
        ),
      };
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
        { [questionId]: action.payload.testCases },
      );
    }
    case actions.AUTOGRADE_FAILURE: {
      // Clear the previous test results in the test case results display.
      const { questionId } = action;

      const questionState = {};
      // For each test case in each test type, add back the data without the output
      // and passed values.
      Object.keys(state[questionId]).forEach((testType) => {
        if (testType !== 'stdout' && testType !== 'stderr') {
          questionState[testType] = state[questionId][testType].map(
            (testCase) => ({
              identifier: testCase.identifier,
              expression: testCase.expression,
              expected: testCase.expected,
            }),
          );
        }
      });

      return {
        ...state,
        [questionId]: questionState,
      };
    }
    default:
      return state;
  }
}
