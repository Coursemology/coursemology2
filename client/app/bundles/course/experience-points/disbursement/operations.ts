import { AxiosResponse } from 'axios';
import { Operation } from 'store';
import {
  DisbursementCourseGroupListData,
  DisbursementCourseUserListData,
  DisbursementCourseUserMiniEntity,
  DisbursementFormData,
  ForumDisbursementFilterParams,
  ForumDisbursementFilters,
  ForumDisbursementFormData,
  ForumDisbursementPostData,
  ForumDisbursementUserData,
  ForumDisbursementUserEntity,
} from 'types/course/disbursement';
import { ForumSearchParams } from 'types/course/forums';

import CourseAPI from 'api/course';

import { actions } from './store';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   experience_points_disbursement: {
 *     reason,
 *     experience_points_records_attributes: [
 *        points_awarded,
 *        course_user_id
 *     ]
 *   }
 */
const formatDisbursementAttribute = (
  data: DisbursementFormData,
  filteredCourseUsers: DisbursementCourseUserMiniEntity[],
): FormData => {
  const payload = new FormData();

  if (data.reason) {
    payload.append('experience_points_disbursement[reason]', data.reason);
  }
  filteredCourseUsers.forEach((courseUser, index) => {
    if (data[`courseUser_${courseUser.id}`]) {
      payload.append(
        `experience_points_disbursement[experience_points_records_attributes][${index}][points_awarded]`,
        data[`courseUser_${courseUser.id}`],
      );
      payload.append(
        `experience_points_disbursement[experience_points_records_attributes][${index}][course_user_id]`,
        courseUser.id.toString(),
      );
    }
  });

  return payload;
};

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   experience_points_disbursement: {
 *     reason, start_time, end_time, weekly_cap
 *     experience_points_records_attributes: [
 *        points_awarded,
 *        course_user_id
 *     ]
 *   }
 */
const formatForumDisbursementAttribute = (
  data: ForumDisbursementFormData,
  forumUsers: ForumDisbursementUserEntity[],
): FormData => {
  const payload = new FormData();

  ['reason', 'startTime', 'endTime', 'weeklyCap'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      // Change to snake casing for backend
      const payloadField = ((str): string =>
        str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`))(field);
      payload.append(
        `experience_points_forum_disbursement[${payloadField}]`,
        data[field],
      );
    }
  });

  forumUsers.forEach((forumUser, index) => {
    if (data[`courseUser_${forumUser.id}`]) {
      payload.append(
        `experience_points_forum_disbursement[experience_points_records_attributes][${index}][points_awarded]`,
        data[`courseUser_${forumUser.id}`],
      );
      payload.append(
        `experience_points_forum_disbursement[experience_points_records_attributes][${index}][course_user_id]`,
        forumUser.id.toString(),
      );
    }
  });
  return payload;
};

const formatFilterAttribute = (
  filter: ForumDisbursementFilters,
): ForumDisbursementFilterParams => ({
  params: {
    'experience_points_forum_disbursement[start_time]': filter.startTime,
    'experience_points_forum_disbursement[end_time]': filter.endTime,
    'experience_points_forum_disbursement[weekly_cap]': filter.weeklyCap,
  },
});

const formatSearchAttribute = (
  filter: ForumDisbursementFilters,
  user: ForumDisbursementUserEntity,
): ForumSearchParams => ({
  params: {
    'search[course_user_id]': user.id,
    'search[start_time]': filter.startTime,
    'search[end_time]': filter.endTime,
  },
});

export function fetchDisbursements(): Operation<
  AxiosResponse<{
    courseGroups: DisbursementCourseGroupListData[];
    courseUsers: DisbursementCourseUserListData[];
  }>
> {
  return async (dispatch) =>
    CourseAPI.disbursement.index().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveDisbursementList(data.courseGroups, data.courseUsers),
      );
      return response;
    });
}

export function fetchForumDisbursements(): Operation<
  AxiosResponse<{
    filters: ForumDisbursementFilters;
    forumUsers: ForumDisbursementUserData[];
  }>
> {
  return async (dispatch) =>
    CourseAPI.disbursement.forumDisbursementIndex().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveForumDisbursementList(data.filters, data.forumUsers),
      );
      return response;
    });
}

export function fetchFilteredForumDisbursements(
  filter: ForumDisbursementFilters,
): Operation<
  AxiosResponse<{
    filters: ForumDisbursementFilters;
    forumUsers: ForumDisbursementUserData[];
  }>
> {
  const filterAttributes: ForumDisbursementFilterParams =
    formatFilterAttribute(filter);

  return async (dispatch) =>
    CourseAPI.disbursement
      .forumDisbursementIndex(filterAttributes)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveForumDisbursementList(data.filters, data.forumUsers),
        );
        return response;
      });
}

export function fetchForumPost(
  user: ForumDisbursementUserEntity,
  filter: ForumDisbursementFilters,
): Operation<
  AxiosResponse<{
    userPosts: ForumDisbursementPostData[];
  }>
> {
  const searchAttributes: ForumSearchParams = formatSearchAttribute(
    filter,
    user,
  );
  return async (dispatch) =>
    CourseAPI.forum.forums.search(searchAttributes).then((response) => {
      const data = response.data;
      dispatch(actions.saveForumPostList(data.userPosts, user.id));
      return response;
    });
}

export function createDisbursement(
  data: DisbursementFormData,
  filteredCourseUsers: DisbursementCourseUserMiniEntity[],
): Operation<
  AxiosResponse<{
    count: number;
  }>
> {
  const attributes = formatDisbursementAttribute(data, filteredCourseUsers);
  return async () =>
    CourseAPI.disbursement.create(attributes).then((response) => response);
}

export function createForumDisbursement(
  data: ForumDisbursementFormData,
  forumUsers: ForumDisbursementUserEntity[],
): Operation<
  AxiosResponse<{
    count: number;
  }>
> {
  const attributes = formatForumDisbursementAttribute(data, forumUsers);
  return async (dispatch) =>
    CourseAPI.disbursement
      .forumDisbursementCreate(attributes)
      .then((response) => {
        dispatch(fetchFilteredForumDisbursements(data));
        return response;
      });
}
