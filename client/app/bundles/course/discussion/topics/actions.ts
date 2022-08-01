import {
  CommentPermissions,
  CommentPostListData,
  CommentSettings,
  CommentTabInfo,
  CommentTopicData,
} from 'types/course/comments';
import {
  CreatePostAction,
  CREATE_POST,
  DeletePostAction,
  DELETE_POST,
  SaveCommentListAction,
  SaveCommentTabAction,
  SavePendingAction,
  SaveReadAction,
  SAVE_COMMENT_LIST,
  SAVE_COMMENT_TAB,
  SAVE_PENDING,
  SAVE_READ,
  UpdatePostAction,
  UPDATE_POST,
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

export function updatePost(postId: number, text: string): UpdatePostAction {
  return {
    type: UPDATE_POST,
    postId,
    text,
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
