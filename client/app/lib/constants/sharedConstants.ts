import type { StaffRoles, CourseUserRoles } from 'types/course/courseUsers';
import {
  InstanceUserRoles,
  RoleRequestRoles,
} from 'types/system/instance/users';
import type { UserRoles } from 'types/users';

// Form options

export const FIELD_DEBOUNCE_DELAY = 250;

// Table options

export const TABLE_ROWS_PER_PAGE = 100;

/**
 * constants needed by both server and client
 */
export const SUPPORTED_VOICE_FILE_TYPES = ['audio/mp3', 'audio/wav'];

export const TIMELINE_ALGORITHMS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'fomo', label: 'Fomo' },
  { value: 'stragglers', label: 'Stragglers' },
  { value: 'otot', label: 'Otot' },
];

export const USER_ROLES: UserRoles = {
  normal: 'Normal',
  administrator: 'Administrator',
};

export const INSTANCE_USER_ROLES: InstanceUserRoles = {
  normal: 'Normal',
  instructor: 'Instructor',
  administrator: 'Administrator',
};

export const ROLE_REQUEST_ROLES: RoleRequestRoles = {
  instructor: 'Instructor',
  administrator: 'Administrator',
};

export const COURSE_USER_ROLES: CourseUserRoles = {
  student: 'Student',
  teaching_assistant: 'Teaching Assistant',
  manager: 'Manager',
  owner: 'Owner',
  observer: 'Observer',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const { student, ...staffRoles } = COURSE_USER_ROLES;
export const STAFF_ROLES: StaffRoles = staffRoles;

export const ITEM_ACTABLE_TYPES = {
  video: {
    name: 'Course::Video',
    value: 'video',
  },
  assessment: {
    name: 'Course::Assessment',
    value: 'assessment',
  },
};

export default {
  SUPPORTED_VOICE_FILE_TYPES,
  TIMELINE_ALGORITHMS,
  USER_ROLES,
  INSTANCE_USER_ROLES,
  ROLE_REQUEST_ROLES,
  COURSE_USER_ROLES,
  STAFF_ROLES,
  ITEM_ACTABLE_TYPES,
};
