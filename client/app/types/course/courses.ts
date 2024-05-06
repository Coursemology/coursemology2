import { Permissions } from 'types';

import { CourseComponentIconName } from 'lib/constants/icons';

import { AchievementBadgeData } from './assessment/assessments';
import { TodoData } from './lesson-plan/todos';
import { AnnouncementData, AnnouncementEntity } from './announcements';
import { CourseUserListData, CourseUserRoles } from './courseUsers';
import { NotificationData } from './notifications';

export type CoursePermissions = Permissions<'canCreate' | 'isCurrentUser'>;

export type CourseDataPermissions = Permissions<
  'isCurrentCourseUser' | 'canManage'
>;

export interface CourseListData {
  id: number;
  title: string;
  description: string;
  logoUrl?: string;
  startAt: string;
}

export interface CourseData extends CourseListData {
  // Either this exists
  registrationInfo?: {
    isDisplayCodeForm: boolean;
    isInvited: boolean;
    enrolRequestId: number | null;
    isEnrollable: boolean;
  };
  instructors?: CourseUserListData[];
  // ---
  // Or this exists
  currentlyActiveAnnouncements?: AnnouncementData[];
  assessmentTodos?: TodoData[];
  videoTodos?: TodoData[];
  surveyTodos?: TodoData[];
  // ---
  notifications: NotificationData[];
  permissions: CourseDataPermissions;
}

export interface CourseMiniEntity {
  id: number;
  title: string;
  description: string;
  logoUrl?: string;
  startAt: string;
}

export interface CourseEntity extends CourseMiniEntity {
  // Either this exists
  registrationInfo?: {
    isDisplayCodeForm: boolean;
    isInvited: boolean;
    enrolRequestId: number | null;
    isEnrollable: boolean;
  };
  instructors?: CourseUserListData[];
  // ---
  // Or this exists
  currentlyActiveAnnouncements: AnnouncementEntity[];
  assessmentTodos: TodoData[];
  videoTodos: TodoData[];
  surveyTodos: TodoData[];
  // ---
  notifications: NotificationData[];
  permissions: CourseDataPermissions;
}

export interface NewCourseFormData {
  title: string;
  description: string;
}

export interface SidebarItemData {
  key: string;
  label: string;
  path: string;
  icon: CourseComponentIconName;
  unread?: number;
}

export interface CourseUserProgressData {
  level?: number;
  exp?: number;
  nextLevelPercentage?: number;
  nextLevelExpDelta?: number | 'max';
  recentAchievements?: AchievementBadgeData[];
  remainingAchievementsCount?: number;
}

export interface CourseLayoutData {
  courseTitle: string;
  courseUrl: string;
  courseUserUrl: string;
  userName: string;
  courseLogoUrl?: string;
  courseUserName?: string;
  courseUserRole?: CourseUserRoles;
  userAvatarUrl?: string;
  homeRedirectsToLearn?: boolean;
  sidebar?: SidebarItemData[];
  adminSidebar?: SidebarItemData[];
  manageEmailSubscriptionUrl?: string;
  progress?: CourseUserProgressData;
}
