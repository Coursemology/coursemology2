import actions from '../constants';

const initialState = {
  topics: {},
  posts: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
      return {
        ...state,
        topics: action.payload.topics.reduce((obj, topic) => (
          { ...obj, [topic.id]: '' }
        ), {}),
      };
    case actions.CREATE_COMMENT_CHANGE: {
      const { topicId, comment } = action.payload;
      return {
        ...state,
        topics: {
          ...state.topics,
          [topicId]: comment,
        },
      };
    }
    case actions.CREATE_COMMENT_SUCCESS: {
      const { topicId } = action.payload;
      return {
        ...state,
        topics: {
          ...state.topics,
          [topicId]: '',
        },
      };
    }
    case actions.UPDATE_COMMENT_CHANGE: {
      const { postId, comment } = action.payload;
      return {
        ...state,
        posts: {
          ...state.posts,
          [postId]: comment,
        },
      };
    }
    case actions.UPDATE_COMMENT_SUCCESS: {
      const { id } = action.payload;
      return {
        ...state,
        posts: {
          ...state.posts,
          [id]: action.payload.text,
        },
      };
    }
    case actions.DELETE_COMMENT_SUCCESS: {
      return {
        ...state,
        posts: Object.keys(state.posts).reduce((obj, key) => {
          if (key !== action.payload.postId.toString()) {
            return { ...obj, [key]: state.posts[key] };
          }
          return obj;
        }, {}),
      };
    }
    default:
      return state;
  }
}
