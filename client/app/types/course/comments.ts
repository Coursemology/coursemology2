import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import { CourseUserBasicListData } from './courseUsers';

/**
 * Data types for comments data retrieved from backend through API call.
 */
export interface CommentTabData {
  type: CommentTabTypes;
  count: number;
}

export interface CommentPermissions {
  canManage: boolean;
  isStudent: boolean;
  isTeachingStaff: boolean;
}

export interface CommentTopicPermissions {
  canTogglePending: boolean;
  canMarkAsRead: boolean;
}

export interface CommentSettings {
  title: string;
  topicsPerPage: number;
}

export interface CommentTopicSettings {
  isPending: boolean;
  isUnread: boolean;
  topicCount: number;
}

export interface CommentTabInfo {
  myStudentExist?: boolean;
  myStudentUnreadCount?: number;
  allStaffUnreadCount?: number;
  allStudentUnreadCount?: number;
}

export interface CommentTopicListData {
  type: string;
  id: number;
  title: string;
}

export interface CommentTopicData extends CommentTopicListData {
  creator: CourseUserBasicListData;
  topicPermissions: CommentTopicPermissions;
  topicSettings: CommentTopicSettings;
  postList: CommentPostListData[];
  links: CommentLinks;
  content?: string; // Programming File Annotation Data
  timestamp?: Date; // Video Data
}

export interface CommentPostListData {
  id: number;
  topicId: number;
  isDelayed: boolean;
  creator: CourseUserBasicListData;
  createdAt: Date;
  title: string;
  text: string;
  canUpdate: boolean;
  canDestroy: boolean;
  codaveriFeedback?: CodaveriFeedback;
  generatedRating?: GeneratedRating;
  workflowState: keyof typeof POST_WORKFLOW_STATE;
  isAiGenerated: boolean;
}

export interface CodaveriFeedback {
  id: number;
  status: string;
  originalFeedback: string;
  rating: number;
}

// A staff rating of an AI-generated post. `type` discriminates which endpoint the client submits to.
interface GeneratedRatingBase {
  id: number;
  rating: number | null;
  originalContent: string;
  editedContent: string | null;
}

export interface RubricFeedbackRating extends GeneratedRatingBase {
  type: 'rubric_feedback';
}

export interface RagWiseRating extends GeneratedRatingBase {
  type: 'rag_wise';
  faithfulnessScore: number;
  answerRelevanceScore: number;
}

export type GeneratedRating = RubricFeedbackRating | RagWiseRating;

export interface CommentLinks {
  titleLink: string;
}

/**
 * Data types for disbursement data used in frontend that are converted from
 * received backend data.
 */

export interface CommentTopicMiniEntity {
  id: number;
  title: string;
}

export interface CommentTopicEntity extends CommentTopicMiniEntity {
  creator: CourseUserBasicListData;
  topicPermissions: CommentTopicPermissions;
  topicSettings: CommentTopicSettings;
  links: CommentLinks;
  content?: string; // Programming File Annotation Data
  timestamp?: Date; // Video Data
}

export interface CommentPostMiniEntity {
  id: number;
  topicId: number;
  isDelayed: boolean;
  creator: CourseUserBasicListData;
  createdAt: Date;
  title: string;
  text: string;
  canUpdate: boolean;
  canDestroy: boolean;
  codaveriFeedback?: CodaveriFeedback;
  generatedRating?: GeneratedRating;
  workflowState: keyof typeof POST_WORKFLOW_STATE;
  isAiGenerated: boolean;
}

export interface CommentPageState {
  tabValue: string;
}

export enum CommentTabTypes {
  MY_STUDENTS_PENDING = 'my_students_pending',
  PENDING = 'pending',
  MY_STUDENTS = 'my_students',
  UNREAD = 'unread',
  ALL = 'all',
}

export enum CommentStatusTypes {
  loading,
  pending,
  notPending,
  read,
  unread,
}
