import {
  CommentPermissions,
  CommentPostListData,
  CommentPostMiniEntity,
  CommentSettings,
  CommentTabInfo,
  CommentTopicData,
  CommentTopicEntity,
  CommentPageState,
} from 'types/course/comments';

import { EntityStore } from 'types/store';

// Action Names

export const SAVE_COMMENT_TAB = 'course/discussion/topics/SAVE_COMMENT_TAB';
export const SAVE_COMMENT_LIST = 'course/discussion/topics/SAVE_COMMENT_LIST';
export const SAVE_PENDING = 'course/discussion/topics/SAVE_PENDING';
export const SAVE_READ = 'course/discussion/topics/SAVE_READ';
export const CREATE_POST = 'course/discussion/topics/CREATE_POST';
export const UPDATE_POST = 'course/discussion/topics/UPDATE_POST';
export const DELETE_POST = 'course/discussion/topics/DELETE_POST';
export const CHANGE_TAB_VALUE = 'course/discussion/topics/CHANGE_TAB_VALUE';

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
}

export interface SavePendingAction {
  type: typeof SAVE_PENDING;
  topicId: number;
}

export interface SaveReadAction {
  type: typeof SAVE_READ;
  topicId: number;
}

export interface CreatePostAction {
  type: typeof CREATE_POST;
  post: CommentPostListData;
}

export interface UpdatePostAction {
  type: typeof UPDATE_POST;
  postId: number;
  text: string;
}

export interface DeletePostAction {
  type: typeof DELETE_POST;
  postId: number;
}

export interface ChangeTabValueAction {
  type: typeof CHANGE_TAB_VALUE;
  tabValue: string;
}

export type CommentActionType =
  | SaveCommentTabAction
  | SaveCommentListAction
  | SavePendingAction
  | SaveReadAction
  | CreatePostAction
  | UpdatePostAction
  | DeletePostAction
  | ChangeTabValueAction;

// State Types

export interface CommentState {
  topicCount: number;
  permissions: CommentPermissions;
  settings: CommentSettings;
  tabs: CommentTabInfo;
  topicList: EntityStore<CommentTopicEntity>;
  postList: EntityStore<CommentPostMiniEntity>;
  pageState: CommentPageState;
}
