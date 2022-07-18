import type { StaffRoles, CourseUserRoles } from 'types/course/courseUsers';

// Form options

export const FIELD_DEBOUNCE_DELAY = 500;

/**
 * constants needed by both server and client
 */
const SUPPORTED_VOICE_FILE_TYPES = ['audio/mp3', 'audio/wav'];

const TIMELINE_ALGORITHMS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'fomo', label: 'Fomo' },
  { value: 'stragglers', label: 'Stragglers' },
  { value: 'otot', label: 'Otot' },
];

const COURSE_USER_ROLES: CourseUserRoles = {
  student: 'Student',
  teaching_assistant: 'Teaching Assistant',
  manager: 'Manager',
  owner: 'Owner',
  observer: 'Observer',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { student, ...staffRoles } = COURSE_USER_ROLES;
const STAFF_ROLES: StaffRoles = staffRoles;

const ITEM_ACTABLE_TYPES = {
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
  COURSE_USER_ROLES,
  STAFF_ROLES,
  ITEM_ACTABLE_TYPES,
};
