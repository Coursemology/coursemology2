import {
  EmojiEvents,
  Flight,
  Folder,
  PieChart,
  Videocam,
} from '@mui/icons-material';
import type { CourseUserRoles, StaffRoles } from 'types/course/courseUsers';
import {
  InstanceUserRoles,
  RoleRequestRoles,
} from 'types/system/instance/users';
import type { Locale, UserRoles } from 'types/users';

// Form options

export const FIELD_DEBOUNCE_DELAY_MS = 500;

// Table options

export const DEFAULT_TABLE_ROWS_PER_PAGE = 100;

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
};

export const COURSE_COMPONENT_ICONS = {
  achievement: EmojiEvents,
  assessment: Flight,
  material: Folder,
  survey: PieChart,
  video: Videocam,
};

export default {
  TIMELINE_ALGORITHMS,
  USER_ROLES,
  INSTANCE_USER_ROLES,
  ROLE_REQUEST_ROLES,
  COURSE_USER_ROLES,
  STAFF_ROLES,
  AVAILABLE_LOCALES,
};
