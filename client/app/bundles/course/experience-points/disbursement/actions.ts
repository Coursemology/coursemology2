import {
  DisbursementCourseGroupListData,
  DisbursementCourseUserListData,
  ForumDisbursementFilters,
  ForumDisbursementUserData,
  ForumPostData,
} from 'types/course/disbursement';
import {
  SaveDisbursementListAction,
  SaveForumDisbursementListAction,
  RemoveForumDisbursementListAction,
  SaveForumPostListAction,
  SAVE_DISBURSEMENT_LIST,
  SAVE_FORUM_DISBURSEMENT_LIST,
  REMOVE_FORUM_DISBURSEMENT_LIST,
  SAVE_FORUM_POST_LIST,
} from './types';

export function saveDisbursementList(
  courseGroups: DisbursementCourseGroupListData[],
  courseUsers: DisbursementCourseUserListData[],
): SaveDisbursementListAction {
  return {
    type: SAVE_DISBURSEMENT_LIST,
    courseGroups,
    courseUsers,
  };
}

export function saveForumDisbursementList(
  filters: ForumDisbursementFilters,
  forumUsers: ForumDisbursementUserData[],
): SaveForumDisbursementListAction {
  return {
    type: SAVE_FORUM_DISBURSEMENT_LIST,
    filters,
    forumUsers,
  };
}

export function removeForumDisbursementList(): RemoveForumDisbursementListAction {
  return {
    type: REMOVE_FORUM_DISBURSEMENT_LIST,
  };
}

export function saveForumPostList(
  posts: ForumPostData[],
  userId: number,
): SaveForumPostListAction {
  return {
    type: SAVE_FORUM_POST_LIST,
    posts,
    userId,
  };
}
