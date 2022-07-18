import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
  CourseUserData,
  CourseUserEntity,
} from './courseUsers';

/**
 * Data types for disbursement data retrieved from backend through API call.
 */

export interface ForumDisbursementFilters {
  startTime: Date;
  endTime: Date;
  weeklyCap: string;
}

export interface ForumDisbursementUserData extends CourseUserData {
  postCount: number;
  voteTally: number;
  points: number;
}

export interface ForumPostData {
  id: number;
  title: string;
  topicSlug: string;
  forumSlug: string;
  content: string;
  voteTally: number;
  createdAt: Date;
}

export interface CourseGroupListData {
  id: number;
  name: string;
  users: CourseUserBasicListData[];
}

/**
 * Data types for disbursement data used in frontend that are converted from
 * received backend data.
 */

export interface CourseGroupMiniEntity {
  id: number;
  name: string;
  users: CourseUserBasicMiniEntity[];
}

export interface ForumDisbursementUserEntity extends CourseUserEntity {
  postCount: number;
  voteTally: number;
  points: number;
}

export interface ForumPostEntity {
  id: number;
  userId: number;
  title: string;
  topicSlug: string;
  forumSlug: string;
  content: string;
  voteTally: number;
  createdAt: Date;
}

/**
 * Data types for disbursement form data.
 */

export interface DisbursementFormData {
  reason: string;
  currentGroup?: string;
  pointList: PointListData[];
}
export interface ForumDisbursementFormData
  extends ForumDisbursementFilters,
    DisbursementFormData {}

export interface PointListData {
  points: string;
  id?: number;
}

export interface CourseGroupOptions {
  value: number;
  label: string;
}

/**
 * Data types for forum disbursement data sent to backend
 */
export interface ForumDisbursementFilterParams {
  params: {
    ['experience_points_forum_disbursement[start_time]']: Date;
    ['experience_points_forum_disbursement[end_time]']: Date;
    ['experience_points_forum_disbursement[weekly_cap]']: string;
  };
}
