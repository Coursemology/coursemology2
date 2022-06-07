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

const USER_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teaching_assistant', label: 'Teaching Assistant' },
  { value: 'manager', label: 'Manager' },
  { value: 'owner', label: 'Owner' },
  { value: 'observer', label: 'Observer' },
];

const STAFF_ROLES = USER_ROLES.slice(1);

export default {
  SUPPORTED_VOICE_FILE_TYPES,
  TIMELINE_ALGORITHMS,
  USER_ROLES,
  STAFF_ROLES,
};
