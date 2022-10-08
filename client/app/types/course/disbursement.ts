/**
 * Data types for disbursement data retrieved from backend through API call.
 */

export interface ForumDisbursementFilters {
  startTime: Date;
  endTime: Date;
  weeklyCap: string;
}

export interface ForumDisbursementUserData {
  id: number;
  name: string;
  level: number;
  exp: number;
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

export interface DisbursementCourseGroupListData {
  id: number;
  name: string;
}

export interface DisbursementCourseUserListData {
  id: number;
  name: string;
  groupIds: number[];
}

/**
 * Data types for disbursement data used in frontend that are converted from
 * received backend data.
 */

export interface DisbursementCourseGroupMiniEntity {
  id: DisbursementCourseGroupListData['id'];
  name: DisbursementCourseGroupListData['name'];
}

export interface DisbursementCourseUserMiniEntity {
  id: DisbursementCourseUserListData['id'];
  name: DisbursementCourseUserListData['name'];
  groupIds: DisbursementCourseUserListData['groupIds'];
}

export interface ForumDisbursementUserEntity {
  id: ForumDisbursementUserData['id'];
  name: ForumDisbursementUserData['name'];
  level: ForumDisbursementUserData['level'];
  exp: ForumDisbursementUserData['exp'];
  postCount: ForumDisbursementUserData['postCount'];
  voteTally: ForumDisbursementUserData['voteTally'];
  points: ForumDisbursementUserData['points'];
}

export interface ForumPostEntity {
  id: ForumPostData['id'];
  title: ForumPostData['title'];
  topicSlug: ForumPostData['topicSlug'];
  forumSlug: ForumPostData['forumSlug'];
  content: ForumPostData['content'];
  voteTally: ForumPostData['voteTally'];
  createdAt: ForumPostData['createdAt'];
  userId: number;
}

/**
 * Data types for disbursement form data.
 */

export interface DisbursementFormData {
  reason: string;
  [key: `courseUser_${number}`]: string;
}
export interface ForumDisbursementFormData
  extends ForumDisbursementFilters,
    DisbursementFormData {}

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
