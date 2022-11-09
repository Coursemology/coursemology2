import {
  CommentPermissions,
  CommentPostListData,
  CommentSettings,
  CommentTabInfo,
  CommentTopicData,
} from 'types/course/comments';

import {
  CHANGE_TAB_VALUE,
  ChangeTabValueAction,
  CREATE_POST,
  CreatePostAction,
  DELETE_POST,
  DeletePostAction,
  SAVE_COMMENT_LIST,
  SAVE_COMMENT_TAB,
  SAVE_PENDING,
  SAVE_READ,
  SaveCommentListAction,
  SaveCommentTabAction,
  SavePendingAction,
  SaveReadAction,
  UPDATE_POST,
  UpdatePostAction,
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
