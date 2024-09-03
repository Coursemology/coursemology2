import { produce } from 'immer';

import actions from '../constants';

const initialState = {
  feedbackUrl: null,
  feedbackByQuestion: {},
};
export default function (state = initialState, action) {
  switch (action.type) {
    case actions.LIVE_FEEDBACK_INITIAL: {
      const { questionId } = action.payload;
      return produce(state, (draft) => {
        if (!(questionId in draft)) {
          draft.feedbackByQuestion[questionId] = {
            isRequestingLiveFeedback: true,
            pendingFeedbackToken: null,
            answerId: null,
            liveFeedbackId: null,
            feedbackFiles: {},
          };
        } else {
          draft.feedbackByQuestion[questionId] = {
            ...draft.feedbackByQuestion[questionId],
            isRequestingLiveFeedback: true,
          };
        }
      });
    }
    case actions.LIVE_FEEDBACK_REQUEST: {
      const { token, questionId, liveFeedbackId, feedbackUrl } = action.payload;
      return produce(state, (draft) => {
        draft.feedbackUrl ??= feedbackUrl;
        if (!(questionId in draft)) {
          draft.feedbackByQuestion[questionId] = {
            isRequestingLiveFeedback: false,
            liveFeedbackId,
            pendingFeedbackToken: token,
          };
        } else {
          draft.feedbackByQuestion[questionId] = {
            isRequestingLiveFeedback: false,
            ...draft.feedbackByQuestion[questionId],
            liveFeedbackId,
            pendingFeedbackToken: token,
          };
        }
      });
    }
    case actions.LIVE_FEEDBACK_SUCCESS: {
      const { questionId, answerId, feedbackFiles } = action.payload;
      return produce(state, (draft) => {
        draft.feedbackByQuestion[questionId] = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          answerId,
          feedbackFiles: feedbackFiles.reduce(
            (feedbackObj, feedbackFile) => ({
              ...feedbackObj,
              [feedbackFile.path]: feedbackFile.feedbackLines.map((line) => ({
                ...line,
                state: 'pending',
              })), // 'pending' | 'resolved' | 'dismissed'
            }),
            {},
          ),
        };
      });
    }
    case actions.LIVE_FEEDBACK_FAILURE: {
      const { questionId } = action.payload;
      return produce(state, (draft) => {
        draft.feedbackByQuestion[questionId] = {
          ...draft.feedbackByQuestion[questionId],
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
        };
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_MARK_RESOLVED: {
      const { questionId, lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft.feedbackByQuestion[questionId].feedbackFiles) {
          draft.feedbackByQuestion[questionId].feedbackFiles[path] =
            draft.feedbackByQuestion[questionId].feedbackFiles[path].map(
              (line) =>
                line.id === lineId ? { ...line, state: 'resolved' } : line,
            );
        }
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_MARK_DISMISSED: {
      const { questionId, lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft.feedbackByQuestion[questionId].feedbackFiles) {
          draft.feedbackByQuestion[questionId].feedbackFiles[path] =
            draft.feedbackByQuestion[questionId].feedbackFiles[path].map(
              (line) =>
                line.id === lineId ? { ...line, state: 'dismissed' } : line,
            );
        }
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_DELETE: {
      const { questionId, lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft.feedbackByQuestion[questionId].feedbackFiles) {
          draft.feedbackByQuestion[questionId].feedbackFiles[path] =
            draft.feedbackByQuestion[questionId].feedbackFiles[path].filter(
              (line) => line.id !== lineId,
            );
          if (
            !draft.feedbackByQuestion[questionId].feedbackFiles[path] ||
            draft.feedbackByQuestion[questionId].feedbackFiles[path].length ===
              0
          ) {
            delete draft.feedbackByQuestion[questionId].feedbackFiles[path];
          }
        }
      });
    }
    default:
      return state;
  }
}
