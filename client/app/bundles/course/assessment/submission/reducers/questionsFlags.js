import actions from '../constants';

function initQuestionsFlagsFromSubmissionPayload(payload) {
  return payload.questions.reduce((obj, question) => {
    const answer = payload.answers.find(
      (ans) => ans.questionId === question.id,
    );
    const lastAutogradingJob = answer?.autogradings?.at(-1)?.job;
    return {
      ...obj,
      [question.id]: {
        isResetting: false,
        isAutograding:
          Boolean(lastAutogradingJob) &&
          lastAutogradingJob.status === 'submitted',
        jobUrl: lastAutogradingJob?.jobUrl,
        jobError:
          Boolean(lastAutogradingJob) &&
          lastAutogradingJob.status === 'errored',
        jobErrorMessage: lastAutogradingJob?.errorMessage,
      },
    };
  }, {});
}

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.FINALISE_SUCCESS:
      return initQuestionsFlagsFromSubmissionPayload(action.payload);
    case actions.REEVALUATE_REQUEST:
    case actions.AUTOGRADE_REQUEST: {
      const { questionId } = action.payload;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: true,
          jobUrl: null,
        },
      };
    }
    case actions.REEVALUATE_SUBMITTED:
    case actions.AUTOGRADE_SUBMITTED: {
      const { questionId, jobUrl } = action.payload;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isAutograding: true,
          jobUrl,
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
          jobUrl: null,
          jobError: false,
          jobErrorMessage: null,
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
          jobUrl: null,
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
