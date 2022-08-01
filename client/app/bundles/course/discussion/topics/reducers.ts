import { produce } from 'immer';
import {
  CommentPermissions,
  CommentPostMiniEntity,
  CommentPostListData,
  CommentSettings,
  CommentTabInfo,
  CommentTopicData,
  CommentTopicEntity,
} from 'types/course/comments';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  CommentState,
  CommentActionType,
  SAVE_COMMENT_LIST,
  SAVE_COMMENT_TAB,
  SAVE_PENDING,
  SAVE_READ,
  DELETE_POST,
  UPDATE_POST,
  CREATE_POST,
} from './types';

const initialState: CommentState = {
  topicCount: 0,
  permissions: {
    canManage: false,
    isStudent: false,
    isTeachingStaff: false,
  } as CommentPermissions,
  settings: { title: '', topicsPerPage: 25 } as CommentSettings,
  tabs: {
    myStudentExist: false,
    myStudentUnreadCount: 0,
    allStaffUnreadCount: 0,
    allStudentUnreadCount: 0,
  } as CommentTabInfo,
  topicList: createEntityStore(),
  postList: createEntityStore(),
};

const reducer = produce((draft: CommentState, action: CommentActionType) => {
  switch (action.type) {
    case SAVE_COMMENT_TAB: {
      draft.permissions = { ...action.permissions };
      draft.settings = { ...action.settings };
      draft.tabs = { ...action.tabs };
      break;
    }
    case SAVE_COMMENT_LIST: {
      draft.topicCount = action.topicCount;
      draft.topicList = createEntityStore();
      draft.postList = createEntityStore();

      const newPostList = [] as CommentPostMiniEntity[];
      const newTopicList = action.topicList?.map((topic: CommentTopicData) => {
        const { postList, ...newTopic } = topic;
        if (postList) {
          postList.forEach((post: CommentPostListData) => {
            newPostList.push({ ...post });
          });
        }
        return newTopic;
      });
      if (newTopicList) {
        saveListToStore(draft.topicList, newTopicList);
      }
      if (newPostList) {
        saveListToStore(draft.postList, newPostList);
      }
      break;
    }
    case SAVE_PENDING: {
      const id: number = action.topicId;
      const topic = draft.topicList.byId[id] as CommentTopicEntity;
      if (topic) {
        const newTopic: CommentTopicEntity = {
          ...topic,
          topicSettings: {
            ...topic.topicSettings,
            isPending: !topic.topicSettings.isPending,
          },
        };
        saveEntityToStore(draft.topicList, newTopic);
      }
      break;
    }
    case SAVE_READ: {
      const id: number = action.topicId;
      const topic = draft.topicList.byId[id] as CommentTopicEntity;
      if (topic) {
        const newTopic: CommentTopicEntity = {
          ...topic,
          topicSettings: {
            ...topic.topicSettings,
            isUnread: !topic.topicSettings.isUnread,
          },
        };
        saveEntityToStore(draft.topicList, newTopic);
      }
      break;
    }
    case UPDATE_POST: {
      const postId = action.postId;
      const post = draft.postList.byId[postId] as CommentPostMiniEntity;
      if (post) {
        const newPost: CommentPostMiniEntity = { ...post, text: action.text };
        saveEntityToStore(draft.postList, newPost);
      }
      break;
    }
    case DELETE_POST: {
      const postId = action.postId;
      const post = draft.postList.byId[postId] as CommentPostMiniEntity;
      if (post) {
        removeFromStore(draft.postList, postId);
      }
      break;
    }
    case CREATE_POST: {
      const post = { ...action.post };
      const id = post.topicId;
      const topic = draft.topicList.byId[id] as CommentTopicEntity;
      if (topic) {
        const newTopic: CommentTopicEntity = {
          ...topic,
          topicSettings: {
            ...topic.topicSettings,
            isPending: false,
            isUnread: false,
          },
        };
        saveEntityToStore(draft.topicList, newTopic);
      }
      saveEntityToStore(draft.postList, post);
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
