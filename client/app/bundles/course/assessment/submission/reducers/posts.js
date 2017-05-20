import actions from '../constants';
import arrayToObjectById from './utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.posts),
      };
    case actions.CREATE_COMMENT_SUCCESS:
    case actions.UPDATE_COMMENT_SUCCESS: {
      const { id: postId } = action.payload;
      return {
        ...state,
        [postId]: action.payload,
      };
    }
    case actions.DELETE_COMMENT_SUCCESS:
      return {
        ...arrayToObjectById(
          Object.values(state).filter(post => (
            post.id !== action.payload.id
          ))
        ),
      };
    default:
      return state;
  }
}
