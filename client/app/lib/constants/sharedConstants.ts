import type { CourseUserRoles, StaffRoles } from 'types/course/courseUsers';
import {
  InstanceUserRoles,
  RoleRequestRoles,
} from 'types/system/instance/users';
import type { Locale, UserRoles } from 'types/users';
import mirrorCreator from 'utilities/mirrorCreator';

// Form options

export const FIELD_DEBOUNCE_DELAY_MS = 500;
export const FIELD_LONG_DEBOUNCE_DELAY_MS = 1500;

// Table options

export const DEFAULT_TABLE_ROWS_PER_PAGE = 100;
export const DEFAULT_MINI_TABLE_ROWS_PER_PAGE = 10;

export const TIMELINE_ALGORITHMS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'fomo', label: 'Fomo' },
  { value: 'stragglers', label: 'Stragglers' },
  { value: 'otot', label: 'Otot' },
];

export const USER_ROLES: Record<UserRoles, string> = {
  normal: 'Normal',
  administrator: 'Administrator',
};

export const INSTANCE_USER_ROLES: Record<InstanceUserRoles, string> = {
  normal: 'Normal',
  instructor: 'Instructor',
  administrator: 'Administrator',
};

export const ROLE_REQUEST_ROLES: Record<RoleRequestRoles, string> = {
  instructor: 'Instructor',
  administrator: 'Administrator',
};

export const COURSE_USER_ROLES: Record<CourseUserRoles, string> = {
  student: 'Student',
  teaching_assistant: 'Teaching Assistant',
  manager: 'Manager',
  owner: 'Owner',
  observer: 'Observer',
};

export const { student, ...staffRoles } = COURSE_USER_ROLES;
export const STAFF_ROLES: Record<StaffRoles, string> = staffRoles;

export const AVAILABLE_LOCALES: { [key in Locale]: string } = {
  en: 'English',
  zh: '中文',
  ko: '한국어',
};

export const SAVING_STATUS = mirrorCreator([
  'None',
  'Saving',
  'Saved',
  'Failed',
]);

export const SYNC_STATUS = mirrorCreator(['Synced', 'Syncing', 'Failed']);

export const MATERIAL_WORKFLOW_STATE = mirrorCreator([
  'not_chunked',
  'chunking',
  'chunked',
]);

export const POST_WORKFLOW_STATE = mirrorCreator([
  'draft',
  'published',
  'delayed',
  'answering',
]);

export default {
  TIMELINE_ALGORITHMS,
  USER_ROLES,
  INSTANCE_USER_ROLES,
  ROLE_REQUEST_ROLES,
  COURSE_USER_ROLES,
  STAFF_ROLES,
  AVAILABLE_LOCALES,
};

export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL ?? 'coursemology@gmail.com';

export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE ?? 'en';

export const DEFAULT_TIME_ZONE =
  process.env.DEFAULT_TIME_ZONE ?? 'Asia/Singapore';

export const NUM_CELL_CLASS_NAME = 'text-right';
