import { defineMessages } from 'react-intl';

export default defineMessages({
  forumsSettings: {
    id: 'course.admin.ForumsSettings.forumsSettings',
    defaultMessage: 'Forums settings',
  },
  markPostAsAnswerSetting: {
    id: 'course.admin.ForumsSettings.markPostAsAnswerSetting',
    defaultMessage: 'User who can mark a post as answer',
  },
  creatorOnly: {
    id: 'course.admin.ForumsSettings.creatorOnly',
    defaultMessage: 'Creator only',
  },
  creatorOnlyDescription: {
    id: 'course.admin.ForumsSettings.creatorOnlyDescription',
    defaultMessage:
      'Post creator (including staff) can mark/unmark a post as the correct answer.',
  },
  everyone: {
    id: 'course.admin.ForumsSettings.everyone',
    defaultMessage: 'Everyone',
  },
  everyoneDescription: {
    id: 'course.admin.ForumsSettings.everyoneDescription',
    defaultMessage:
      'Everyone (including staff) can mark/unmark a post as the correct answer.',
  },
  allowStudentsTo: {
    id: 'course.admin.ForumsSettings.allowStudentsTo',
    defaultMessage: 'Allow students to',
  },
  allowAnonymousPost: {
    id: 'course.admin.ForumsSettings.allowAnonymousPost',
    defaultMessage: 'Post anonymously',
  },
  allowAnonymousPostDescription: {
    id: 'course.admin.ForumsSettings.allowAnonymousPostDescription',
    defaultMessage:
      'Post creator and course instructors are still able to view the identity of the original author.',
  },
});
