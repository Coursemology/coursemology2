import { arrayToObjectWithKey } from 'utilities/array';

import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      return {
        ...state,
        ...action.payload.annotations.reduce(
          (obj, annotation) => ({
            ...obj,
            [annotation.fileId]: {
              fileId: annotation.fileId,
              topics: arrayToObjectWithKey(annotation.topics, 'id'),
            },
          }),
          {},
        ),
      };
    }
    case actions.CREATE_ANNOTATION_SUCCESS: {
      const { topicId, id: postId, fileId, line } = action.payload;
      const topic = state[fileId].topics[topicId] || {
        id: topicId,
        line,
        postIds: [],
      };

      return {
        ...state,
        [fileId]: {
          ...state[fileId],
          topics: {
            ...state[fileId].topics,
            [topicId]: {
              ...topic,
              postIds: [...topic.postIds, postId],
            },
          },
        },
      };
    }
    case actions.DELETE_ANNOTATION_SUCCESS: {
      const { fileId, topicId, postId } = action.payload;
      const postIds = state[fileId].topics[topicId].postIds.filter(
        (id) => id !== postId,
      );
      const topics = Object.keys(state[fileId].topics).reduce((obj, key) => {
        if (key !== topicId.toString()) {
          return { ...obj, [key]: state[fileId].topics[key] };
        }
        return postIds.length === 0
          ? obj
          : {
              ...obj,
              [key]: {
                ...state[fileId].topics[key],
                postIds,
              },
            };
      }, {});

      return {
        ...state,
        [fileId]: {
          ...state[fileId],
          topics,
        },
      };
    }
    case actions.SAVE_ANSWER_SUCCESS:
    case actions.AUTOGRADE_SUCCESS: {
      const { latestAnswer } = action.payload;
      if (latestAnswer && latestAnswer.annotations) {
        return {
          ...state,
          ...latestAnswer.annotations.reduce(
            (obj, annotation) => ({
              ...obj,
              [annotation.fileId]: {
                fileId: annotation.fileId,
                topics: arrayToObjectWithKey(annotation.topics, 'id'),
              },
            }),
            {},
          ),
        };
      }
      return state;
    }
    default:
      return state;
  }
}
