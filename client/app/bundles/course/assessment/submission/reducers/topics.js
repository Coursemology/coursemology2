import actions from '../constants';
import arrayToObjectById from './utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.topics),
      };
    case actions.CREATE_COMMENT_SUCCESS: {
      const { topicId, id: postId } = action.payload;
      return {
        ...state,
        [topicId]: {
          ...state[topicId],
          postIds: [...state[topicId].postIds, postId],
        },
      };
    }
    case actions.DELETE_COMMENT_SUCCESS: {
      const { topicId, postId } = action.payload;
      return {
        ...state,
        [topicId]: {
          ...state[topicId],
          postIds: state[topicId].postIds.filter(id => id !== postId),
        },
      };
    }
    default:
      return state;
  }
}
