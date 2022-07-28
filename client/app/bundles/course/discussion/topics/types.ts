import {
  CommentPermissions,
  CommentPostListData,
  CommentPostMiniEntity,
  CommentSettings,
  CommentTabInfo,
  CommentTopicData,
  CommentTopicEntity,
} from 'types/course/comments';

import { EntityStore } from 'types/store';

// Action Names

export const SAVE_COMMENT_TAB = 'course/discussion/topics/SAVE_COMMENT_TAB';
export const SAVE_COMMENT_LIST = 'course/discussion/topics/SAVE_COMMENT_LIST';
export const SAVE_PENDING = 'course/discussion/topics/SAVE_PENDING';
export const SAVE_READ = 'course/discussion/topics/SAVE_READ';
export const UPDATE_POST = 'course/discussion/topics/UPDATE_POST';
export const DELETE_POST = 'course/discussion/topics/DELETE_POST';
export const CREATE_POST = 'course/discussion/topics/CREATE_POST';

// Action Types

export interface SaveCommentTabAction {
  type: typeof SAVE_COMMENT_TAB;
  permissions: CommentPermissions;
  settings: CommentSettings;
  tabs: CommentTabInfo;
}

export interface SaveCommentListAction {
  type: typeof SAVE_COMMENT_LIST;
  topicCount: number;
  topicList: CommentTopicData[];
  tabValue: string;
}

export interface SavePendingAction {
  type: typeof SAVE_PENDING;
  topicId: number;
}

export interface SaveReadAction {
  type: typeof SAVE_READ;
  topicId: number;
}

export interface DeletePostAction {
  type: typeof DELETE_POST;
  postId: number;
}
export interface UpdatePostAction {
  type: typeof UPDATE_POST;
  postId: number;
  text: string;
}
export interface CreatePostAction {
  type: typeof CREATE_POST;
  post: CommentPostListData;
}

export type CommentActionType =
  | SaveCommentTabAction
  | SaveCommentListAction
  | SavePendingAction
  | SaveReadAction
  | DeletePostAction
  | UpdatePostAction
  | CreatePostAction;

// State Types

export interface CommentState {
  topicCount: number;
  permissions: CommentPermissions;
  settings: CommentSettings;
  tabs: CommentTabInfo;
  topicList: EntityStore<CommentTopicEntity>;
  postList: EntityStore<CommentPostMiniEntity>;
}
