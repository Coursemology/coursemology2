import {
  DisbursementCourseGroupListData,
  DisbursementCourseGroupMiniEntity,
  DisbursementCourseUserListData,
  DisbursementCourseUserMiniEntity,
  ForumDisbursementFilters,
  ForumDisbursementPostData,
  ForumDisbursementPostEntity,
  ForumDisbursementUserData,
  ForumDisbursementUserEntity,
} from 'types/course/disbursement';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_DISBURSEMENT_LIST =
  'course/experience-points/disbursement/SAVE_DISBURSEMENT_LIST';
export const SAVE_FORUM_DISBURSEMENT_LIST =
  'course/experience-points/disbursement/SAVE_FORUM_DISBURSEMENT_LIST';
export const REMOVE_FORUM_DISBURSEMENT_LIST =
  'course/experience-points/disbursement/REMOVE_FORUM_DISBURSEMENT_LIST';
export const SAVE_FORUM_POST_LIST =
  'course/experience-points/disbursement/SAVE_FORUM_POST_LIST';

// Action Types

export interface SaveDisbursementListAction {
  type: typeof SAVE_DISBURSEMENT_LIST;
  courseGroups: DisbursementCourseGroupListData[];
  courseUsers: DisbursementCourseUserListData[];
}
export interface SaveForumDisbursementListAction {
  type: typeof SAVE_FORUM_DISBURSEMENT_LIST;
  filters: ForumDisbursementFilters;
  forumUsers: ForumDisbursementUserData[];
}

export interface RemoveForumDisbursementListAction {
  type: typeof REMOVE_FORUM_DISBURSEMENT_LIST;
}

export interface SaveForumPostListAction {
  type: typeof SAVE_FORUM_POST_LIST;
  posts: ForumDisbursementPostData[];
  userId: number;
}

export type DisbursementActionType =
  | SaveDisbursementListAction
  | SaveForumDisbursementListAction
  | RemoveForumDisbursementListAction
  | SaveForumPostListAction;

// State Types

export interface DisbursementState {
  courseGroups: EntityStore<DisbursementCourseGroupMiniEntity>;
  courseUsers: EntityStore<DisbursementCourseUserMiniEntity>;
  filters: ForumDisbursementFilters;
  forumUsers: EntityStore<ForumDisbursementUserEntity>;
  forumPosts: EntityStore<ForumDisbursementPostEntity>;
}
