import actions from '../constants';

const initialState = {
  annotations: {},
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
        annotations: action.payload.annotations.reduce((obj, annotation) => (
          { ...obj, [annotation.fileId]: {} }
        ), {}),
      };
    case actions.CREATE_ANNOTATION_CHANGE: {
      const { fileId, line, text } = action.payload;
      return {
        ...state,
        annotations: {
          ...state.annotations,
          [fileId]: { [line]: text },
        },
      };
    }
    case actions.CREATE_ANNOTATION_SUCCESS: {
      const { fileId, line } = action.payload;
      return {
        ...state,
        annotations: {
          ...state.annotations,
          [fileId]: {
            ...state.annotations[fileId],
            [line]: '',
          },
        },
      };
    }
    case actions.CREATE_COMMENT_CHANGE: {
      const { topicId, text } = action.payload;
      return {
        ...state,
        topics: {
          ...state.topics,
          [topicId]: text,
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
    case actions.UPDATE_ANNOTATION_CHANGE:
    case actions.UPDATE_COMMENT_CHANGE: {
      const { postId, text } = action.payload;
      return {
        ...state,
        posts: {
          ...state.posts,
          [postId]: text,
        },
      };
    }
    case actions.UPDATE_ANNOTATION_SUCCESS:
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
    case actions.DELETE_ANNOTATION_SUCCESS:
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
