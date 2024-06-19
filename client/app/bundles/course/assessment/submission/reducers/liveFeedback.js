

import actions from '../constants';
const initialState = {
  // token for current (pending) feedback request
  feedbackRequestToken: null,
  // map of filename to individual feedback items
  feedbackFiles: {},
};
  
export default function (state = initialState, action) {
  switch (action.type) {
    case actions.LIVE_FEEDBACK_REQUEST: {
      return { ...state, feedbackRequestToken: action.payload.token };
    }
    case actions.LIVE_FEEDBACK_SUCCESS: {
      return {
        ...state,
        //feedbackRequestToken: null,
        feedbackFiles: action.payload.feedbackFiles.reduce((feedbackObj, feedbackFile) => ({
          ...feedbackObj,
          [feedbackFile.path]: feedbackFile.feedbackLines.map((line) => 
            ({ ...line, state: 'pending' })) // 'pending' | 'resolved' | 'dismissed'
        }), {})
      };
    }
    case actions.LIVE_FEEDBACK_FAILURE: {
      return { ...state, feedbackRequestToken: null };
    }
    case actions.LIVE_FEEDBACK_ITEM_MARK_RESOLVED: {
      const { lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft.feedbackFiles) {
          draft.feedbackFiles[path] = draft.feedbackFiles[path].map((line) => 
            (line.id === lineId ? { ...line, state: 'resolved' }: line));
        }
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_MARK_DISMISSED: {
      const { lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft.feedbackFiles) {
          draft.feedbackFiles[path] = draft.feedbackFiles[path].map((line) => 
            (line.id === lineId ? { ...line, state: 'dismissed' }: line));
        }
      });
    }
    case actions.LIVE_FEEDBACK_ITEM_DELETE: {
      const { lineId, path } = action.payload;
      return produce(state, (draft) => {
        if (path in draft.feedbackFiles) {
          draft.feedbackFiles[path] = draft.feedbackFiles[path].filter((line) => line.id !== lineId);
          if (!draft.feedbackFiles[path] || draft.feedbackFiles[path].length === 0) {
            delete draft.feedbackFiles[path];
          }
        }
      });
    }
    default:
      return state;
  }
}
