import actions from '../constants';
import { arrayToObjectById } from '../utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.posts),
      };
    case actions.CREATE_COMMENT_SUCCESS:
    case actions.UPDATE_COMMENT_SUCCESS:
    case actions.CREATE_ANNOTATION_SUCCESS:
    case actions.UPDATE_ANNOTATION_SUCCESS: {
      const { id } = action.payload;
      return {
        ...state,
        [id]: action.payload,
      };
    }
    case actions.DELETE_COMMENT_SUCCESS:
    case actions.DELETE_ANNOTATION_SUCCESS:
      return Object.keys(state).reduce((obj, key) => {
        if (key !== action.payload.postId.toString()) {
          return { ...obj, [key]: state[key] };
        }
        return obj;
      }, {});
    default:
      return state;
  }
}
