import { arrayToObjectWithKey } from 'utilities/array';

import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FETCH_ANNOTATION_SUCCESS:
      return {
        ...state,
        ...arrayToObjectWithKey(action.payload.posts, 'id'),
      };
    case actions.AUTOGRADE_RUBRIC_SUCCESS:
    case actions.CREATE_COMMENT_SUCCESS:
    case actions.UPDATE_COMMENT_SUCCESS:
    case actions.CREATE_ANNOTATION_SUCCESS:
    case actions.UPDATE_ANNOTATION_SUCCESS: {
      const post =
        action.type === actions.AUTOGRADE_RUBRIC_SUCCESS
          ? action.payload.aiGeneratedComment
          : action.payload;
      const { id } = post;
      return {
        ...state,
        [id]: post,
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
