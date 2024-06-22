import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.FINALISE_SUCCESS:
      return action.payload.questions.reduce((obj, question) => {
        const answer = action.payload.answers.find(
          (ans) => ans.questionId === question.id,
        );
        return {
          ...obj,
          [question.id]: {
            isResetting: false,
            isAutograding:
              Boolean(answer?.autograding) &&
              answer?.autograding?.status === 'submitted',
            jobError:
              Boolean(answer?.autograding) &&
              answer?.autograding?.status === 'errored',
            jobErrorMessage: answer?.autograding?.errorMessage,
          },
        };
      }, {});
    case actions.REEVALUATE_REQUEST:
    case actions.AUTOGRADE_REQUEST: {
      const { questionId } = action.payload;
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
      const { questionId } = action.payload;
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
      const jobError = payload?.status === 'errored';
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: false,
          jobError: Boolean(jobError),
          jobErrorMessage: payload?.errorMessage,
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
