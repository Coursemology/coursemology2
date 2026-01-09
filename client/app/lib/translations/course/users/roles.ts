import { defineMessages } from 'react-intl';

const translations = defineMessages({
  student: {
    id: 'lib.translations.course.users.roles.student',
    defaultMessage: 'Student',
  },
  teaching_assistant: {
    id: 'lib.translations.course.users.roles.teachingAssistant',
    defaultMessage: 'Teaching Assistant',
  },
  manager: {
    id: 'lib.translations.course.users.roles.manager',
    defaultMessage: 'Manager',
  },
  owner: {
    id: 'lib.translations.course.users.roles.owner',
    defaultMessage: 'Owner',
  },
  observer: {
    id: 'lib.translations.course.users.roles.observer',
    defaultMessage: 'Observer',
  },
});

export default translations;
