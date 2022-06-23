import { Permissions } from 'types';
import { AnnouncementListData, AnnouncementMiniEntity } from './announcements';
import { CourseUserListData } from './courseUsers';
import { TodoData } from './lesson-plan/todos';
import { NotificationData } from './notifications';

export type CoursePermissions = Permissions<'canCreate'>;

export type CourseDataPermissions = Permissions<
  'isCurrentCourseUser' | 'canManage'
>;

export interface CourseListData {
  id: number;
  title: string;
  description: string;
  logoUrl: string;
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
  currentlyActiveAnnouncements?: AnnouncementListData[];
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
  logoUrl: string;
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
  currentlyActiveAnnouncements: AnnouncementMiniEntity[];
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
