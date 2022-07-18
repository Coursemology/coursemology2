import { CourseUserListData } from 'types/course/courseUsers';
import {
  CourseGroupListData,
  ForumDisbursementFilters,
  ForumDisbursementUserData,
  ForumPostData,
} from 'types/course/disbursement';
import {
  SaveDisbursementListAction,
  SaveForumDisbursementListAction,
  SaveForumPostListAction,
  SAVE_DISBURSEMENT_LIST,
  SAVE_FORUM_DISBURSEMENT_LIST,
  SAVE_FORUM_POST_LIST,
} from './types';

export function saveDisbursementList(
  currentGroup: CourseGroupListData | null,
  courseGroups: CourseGroupListData[],
  courseUsers: CourseUserListData[],
): SaveDisbursementListAction {
  return {
    type: SAVE_DISBURSEMENT_LIST,
    currentGroup,
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
