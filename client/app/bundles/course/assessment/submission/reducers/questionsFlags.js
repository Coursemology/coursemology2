import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS:
      return action.payload.answers.reduce((obj, answer) => ({
        ...obj,
        [answer.questionId]: {
          isResetting: false,
          isAutograding: !!answer.autograding && answer.autograding.status === 'submitted',
          hasError: !!answer.autograding && answer.autograding.status === 'errored',
        },
      }), {});
    case actions.AUTOGRADE_REQUEST: {
      const { questionId } = action;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: true,
        },
      };
    }
    case actions.AUTOGRADE_SUCCESS: {
      const { questionId } = action;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: false,
          hasError: false,
        },
      };
    }
    case actions.AUTOGRADE_FAILURE: {
      const { questionId } = action;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: false,
          hasError: true,
        },
      };
    }
    case actions.RESET_REQUEST: {
      const { questionId } = action;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isResetting: true,
        },
      };
    }
    case actions.RESET_SUCCESS:
    case actions.RESET_FAILURE: {
      const { questionId } = action;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isResetting: false,
        },
      };
    }
    default:
      return state;
  }
}
