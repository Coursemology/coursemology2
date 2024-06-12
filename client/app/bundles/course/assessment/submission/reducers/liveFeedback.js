import { produce } from 'immer';

import actions from '../constants';
  
export default function (state = {}, action) {
  switch (action.type) {
    case actions.LIVE_FEEDBACK_INITIAL: {
      const { questionId } = action.payload;
      return produce(state, (draft) => {
        if (!(questionId in draft)) {
          draft[questionId] = {
            isRequestingLiveFeedback: true,
            pendingFeedbackToken: null,
            answerId: null,
            feedbackFiles: {}
          };
        } else {
          draft[questionId] = {
            ...draft[questionId],
            isRequestingLiveFeedback: true,
          };
        }
      });
    }
    case actions.LIVE_FEEDBACK_REQUEST: {
      const { token, questionId } = action.payload;
      return produce(state, (draft) => {
        if (!(questionId in draft)) {
          draft[questionId] = {
            isRequestingLiveFeedback: false,
            pendingFeedbackToken: token,
          };
        } else {
          draft[questionId] = {
            isRequestingLiveFeedback: false,
            ...draft[questionId],
            pendingFeedbackToken: token,
          };
        }
      });
    }
    case actions.LIVE_FEEDBACK_SUCCESS: {
      const { questionId, answerId, feedbackFiles } = action.payload;
      return produce(state, (draft) => {
        draft[questionId] = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          answerId: answerId,
          feedbackFiles: feedbackFiles.reduce((feedbackObj, feedbackFile) => ({
            ...feedbackObj,
            [feedbackFile.path]: feedbackFile.feedbackLines.map((line) => 
              ({ ...line, state: 'pending' })) // 'pending' | 'resolved' | 'dismissed'
          }), {})
        };
      });
    }
    case actions.LIVE_FEEDBACK_FAILURE: {
      const { questionId } = action.payload;
      return produce(state, (draft) => {
        draft[questionId] = {
          ...draft[questionId],
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
        }
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_MARK_RESOLVED: {
      const { questionId, lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft[questionId].feedbackFiles) {
          draft[questionId].feedbackFiles[path] = draft[questionId].feedbackFiles[path].map((line) => 
            (line.id === lineId ? { ...line, state: 'resolved' }: line));
        }
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_MARK_DISMISSED: {
      const { questionId, lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft[questionId].feedbackFiles) {
          draft[questionId].feedbackFiles[path] = draft[questionId].feedbackFiles[path].map((line) => 
            (line.id === lineId ? { ...line, state: 'dismissed' }: line));
        }
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_DELETE: {
      const { questionId, lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft[questionId].feedbackFiles) {
          draft[questionId].feedbackFiles[path] = draft[questionId].feedbackFiles[path].filter((line) => line.id !== lineId);
          if (!draft[questionId].feedbackFiles[path] || draft[questionId].feedbackFiles[path].length === 0) {
            delete draft[questionId].feedbackFiles[path];
          }
        }
      });
    }
    default:
      return state;
  }
}
