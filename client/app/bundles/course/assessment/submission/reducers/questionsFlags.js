import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.FINALISE_SUCCESS:
      return action.payload.answers.reduce(
        (obj, answer) => ({
          ...obj,
          [answer.questionId]: {
            isResetting: false,
            isAutograding:
              !!answer.autograding && answer.autograding.status === 'submitted',
            jobError:
              !!answer.autograding && answer.autograding.status === 'errored',
          },
        }),
        {},
      );
    case actions.REEVALUATE_REQUEST:
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
    case actions.REEVALUATE_SUCCESS:
    case actions.AUTOGRADE_SUCCESS: {
      const { questionId } = action;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: false,
          jobError: false,
        },
      };
    }
    case actions.REEVALUATE_FAILURE:
    case actions.AUTOGRADE_FAILURE: {
      const { questionId, payload } = action;
      const jobError = payload && payload.status === 'errored';
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: false,
          jobError: !!jobError,
          jobErrorMessage:
            payload && payload.detailed_message
              ? payload.detailed_message
              : null,
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
