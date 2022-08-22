import {
  CommentPermissions,
  CommentPostListData,
  CommentSettings,
  CommentTabInfo,
  CommentTopicData,
} from 'types/course/comments';
import {
  CREATE_POST,
  DELETE_POST,
  SAVE_COMMENT_LIST,
  SAVE_COMMENT_TAB,
  SAVE_PENDING,
  SAVE_READ,
  UPDATE_POST,
  CHANGE_TAB_VALUE,
  SaveCommentTabAction,
  SaveCommentListAction,
  SavePendingAction,
  SaveReadAction,
  CreatePostAction,
  UpdatePostAction,
  DeletePostAction,
  ChangeTabValueAction,
} from './types';

export function saveCommentTab(
  permissions: CommentPermissions,
  settings: CommentSettings,
  tabs: CommentTabInfo,
): SaveCommentTabAction {
  return {
    type: SAVE_COMMENT_TAB,
    permissions,
    settings,
    tabs,
  };
}

export function saveCommentList(
  topicCount: number,
  topicList: CommentTopicData[],
): SaveCommentListAction {
  return {
    type: SAVE_COMMENT_LIST,
    topicCount,
    topicList,
  };
}

export function savePending(topicId: number): SavePendingAction {
  return {
    type: SAVE_PENDING,
    topicId,
  };
}

export function saveRead(topicId: number): SaveReadAction {
  return {
    type: SAVE_READ,
    topicId,
  };
}

export function updatePost(post: CommentPostListData): UpdatePostAction {
  return {
    type: UPDATE_POST,
    post,
  };
}

export function deletePost(postId: number): DeletePostAction {
  return {
    type: DELETE_POST,
    postId,
  };
}

export function createPost(post: CommentPostListData): CreatePostAction {
  return {
    type: CREATE_POST,
    post,
  };
}

export function changeTabValue(tabValue: string): ChangeTabValueAction {
  return {
    type: CHANGE_TAB_VALUE,
    tabValue,
  };
}
