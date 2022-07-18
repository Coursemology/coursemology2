import CourseAPI from 'api/course';
import { AxiosResponse } from 'axios';
import { CourseUserListData } from 'types/course/courseUsers';
import {
  CourseGroupListData,
  DisbursementFormData,
  ForumDisbursementFilters,
  ForumDisbursementFormData,
  ForumDisbursementFilterParams,
  ForumDisbursementUserData,
  PointListData,
  ForumPostData,
} from 'types/course/disbursement';
import { ForumSearchParams } from 'types/course/forum';
import { Operation } from 'types/store';
import * as actions from './actions';

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
const formatDisbursementAttribute = (data: DisbursementFormData): FormData => {
  const payload = new FormData();

  if (data.reason !== undefined && data.reason !== null) {
    payload.append('experience_points_disbursement[reason]', data.reason);
  }

  data.pointList.forEach((point: PointListData, index) => {
    if (point.id) {
      payload.append(
        `experience_points_disbursement[experience_points_records_attributes][${index}][points_awarded]`,
        point.points,
      );
      payload.append(
        `experience_points_disbursement[experience_points_records_attributes][${index}][course_user_id]`,
        point.id?.toString() ?? '',
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

  data.pointList.forEach((point: PointListData, index) => {
    if (point.id) {
      payload.append(
        `experience_points_forum_disbursement[experience_points_records_attributes][${index}][points_awarded]`,
        point.points,
      );
      payload.append(
        `experience_points_forum_disbursement[experience_points_records_attributes][${index}][course_user_id]`,
        point.id?.toString() ?? '',
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
  user: ForumDisbursementUserData,
): ForumSearchParams => ({
  params: {
    'search[course_user_id]': user.id,
    'search[start_time]': filter.startTime,
    'search[end_time]': filter.endTime,
  },
});

export function fetchDisbursements(): Operation<
  AxiosResponse<{
    currentGroup: CourseGroupListData | null;
    courseGroups: CourseGroupListData[];
    courseUsers: CourseUserListData[];
  }>
> {
  return async (dispatch) =>
    CourseAPI.disbursement
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveDisbursementList(
            data.currentGroup,
            data.courseGroups,
            data.courseUsers,
          ),
        );
        return response;
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchForumDisbursements(): Operation<
  AxiosResponse<{
    filters: ForumDisbursementFilters;
    forumUsers: ForumDisbursementUserData[];
  }>
> {
  return async (dispatch) =>
    CourseAPI.disbursement
      .forumDisbursementIndex()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveForumDisbursementList(data.filters, data.forumUsers),
        );
        return response;
      })
      .catch((error) => {
        throw error;
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
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchForumPost(
  user: ForumDisbursementUserData,
  filter: ForumDisbursementFilters,
): Operation<
  AxiosResponse<{
    id: number;
    name: string;
    userPosts: ForumPostData[];
  }>
> {
  const searchAttributes: ForumSearchParams = formatSearchAttribute(
    filter,
    user,
  );
  return async (dispatch) =>
    CourseAPI.forum.search(searchAttributes).then((response) => {
      const data = response.data;
      dispatch(actions.saveForumPostList(data.userPosts, user.id));
      return response;
    });
}

export function createDisbursement(data: DisbursementFormData): Operation<
  AxiosResponse<{
    count: number;
  }>
> {
  const attributes = formatDisbursementAttribute(data);
  return async () =>
    CourseAPI.disbursement.create(attributes).then((response) => response);
}

export function createForumDisbursement(
  data: ForumDisbursementFormData,
): Operation<
  AxiosResponse<{
    count: number;
  }>
> {
  const attributes = formatForumDisbursementAttribute(data);
  return async (dispatch) =>
    CourseAPI.disbursement
      .forumDisbursementCreate(attributes)
      .then((response) => {
        dispatch(fetchFilteredForumDisbursements(data));
        return response;
      });
}
