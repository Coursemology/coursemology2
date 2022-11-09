import { produce } from 'immer';
import { CommentPostMiniEntity, CommentTabTypes } from 'types/course/comments';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  CHANGE_TAB_VALUE,
  CommentActionType,
  CommentState,
  CREATE_POST,
  DELETE_POST,
  SAVE_COMMENT_LIST,
  SAVE_COMMENT_TAB,
  SAVE_PENDING,
  SAVE_READ,
  UPDATE_POST,
} from './types';

const initialState: CommentState = {
  topicCount: 0,
  permissions: {
    canManage: false,
    isStudent: false,
    isTeachingStaff: false,
  },
  settings: { title: '', topicsPerPage: 25 },
  tabs: {
    myStudentExist: false,
    myStudentUnreadCount: 0,
    allStaffUnreadCount: 0,
    allStudentUnreadCount: 0,
  },
  topicList: createEntityStore(),
  postList: createEntityStore(),
  pageState: {
    tabValue: '',
  },
};

const reducer = produce((draft: CommentState, action: CommentActionType) => {
  switch (action.type) {
    case SAVE_COMMENT_TAB: {
      draft.permissions = { ...action.permissions };
      draft.settings = { ...action.settings };
      draft.tabs = { ...action.tabs };

      if (action.permissions.canManage) {
        if (action.tabs.myStudentExist) {
          draft.pageState.tabValue = CommentTabTypes.MY_STUDENTS_PENDING;
        } else {
          draft.pageState.tabValue = CommentTabTypes.PENDING;
        }
      } else {
        draft.pageState.tabValue = CommentTabTypes.UNREAD;
      }

      break;
    }
    case SAVE_COMMENT_LIST: {
      draft.topicCount = action.topicCount;
      draft.topicList = createEntityStore();
      draft.postList = createEntityStore();

      const newPostList = [] as CommentPostMiniEntity[];
      const newTopicList = action.topicList?.map((topic) => {
        const { postList, ...newTopic } = topic;
        if (postList) {
          postList.forEach((post) => {
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
      const topic = draft.topicList.byId[id];
      if (topic) {
        const newTopic = {
          ...topic,
          topicSettings: {
            ...topic.topicSettings,
            isPending: !topic.topicSettings.isPending,
          },
        };
        saveEntityToStore(draft.topicList, newTopic);

        // To update pending bubble count shown on the comment tabs.
        if (topic.topicSettings.isPending) {
          if (
            draft.pageState.tabValue === CommentTabTypes.MY_STUDENTS_PENDING ||
            draft.pageState.tabValue === CommentTabTypes.MY_STUDENTS
          ) {
            draft.tabs.myStudentUnreadCount! -= 1;
            draft.tabs.allStaffUnreadCount! -= 1;
          } else if (
            draft.pageState.tabValue === CommentTabTypes.PENDING ||
            draft.pageState.tabValue === CommentTabTypes.ALL
          ) {
            draft.tabs.allStaffUnreadCount! -= 1;
          }
        } else if (!topic.topicSettings.isPending) {
          if (
            draft.pageState.tabValue === CommentTabTypes.MY_STUDENTS_PENDING ||
            draft.pageState.tabValue === CommentTabTypes.MY_STUDENTS
          ) {
            draft.tabs.myStudentUnreadCount! += 1;
            draft.tabs.allStaffUnreadCount! += 1;
          } else if (
            draft.pageState.tabValue === CommentTabTypes.PENDING ||
            draft.pageState.tabValue === CommentTabTypes.ALL
          ) {
            draft.tabs.allStaffUnreadCount! += 1;
          }
        }
      }
      break;
    }
    case SAVE_READ: {
      const id: number = action.topicId;
      const topic = draft.topicList.byId[id];
      if (topic) {
        const newTopic = {
          ...topic,
          topicSettings: {
            ...topic.topicSettings,
            isUnread: !topic.topicSettings.isUnread,
          },
        };
        saveEntityToStore(draft.topicList, newTopic);

        if (topic.topicSettings.isUnread && draft.tabs.allStudentUnreadCount) {
          draft.tabs.allStudentUnreadCount -= 1;
        }
      }
      break;
    }
    case CREATE_POST: {
      const post = { ...action.post };
      const id = post.topicId;
      const topic = draft.topicList.byId[id];
      if (topic) {
        const newTopic = {
          ...topic,
          topicSettings: {
            ...topic.topicSettings,
            isPending: false,
            isUnread: false,
          },
        };
        saveEntityToStore(draft.topicList, newTopic);

        // To update pending bubble count shown on the comment tabs.
        // When a new post of a topic is created, mark_as_pending is marked as false
        // in the backend side.
        if (topic.topicSettings.isPending) {
          if (
            draft.pageState.tabValue === CommentTabTypes.MY_STUDENTS_PENDING ||
            draft.pageState.tabValue === CommentTabTypes.MY_STUDENTS
          ) {
            draft.tabs.myStudentUnreadCount! -= 1;
            draft.tabs.allStaffUnreadCount! -= 1;
          } else if (
            draft.pageState.tabValue === CommentTabTypes.PENDING ||
            draft.pageState.tabValue === CommentTabTypes.ALL
          ) {
            draft.tabs.allStaffUnreadCount! -= 1;
          }
        }
      }
      saveEntityToStore(draft.postList, post);
      break;
    }
    case UPDATE_POST: {
      const post = action.post;
      removeFromStore(draft.postList, post.id);
      saveEntityToStore(draft.postList, post);

      break;
    }
    case DELETE_POST: {
      const postId = action.postId;
      const post = draft.postList.byId[postId];
      if (post) {
        removeFromStore(draft.postList, postId);
      }
      break;
    }
    case CHANGE_TAB_VALUE: {
      draft.pageState.tabValue = action.tabValue;
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
