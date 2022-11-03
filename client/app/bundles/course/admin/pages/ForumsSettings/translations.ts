import { defineMessages } from 'react-intl';

export default defineMessages({
  forumsSettings: {
    id: 'course.admin.forums.forumsSettings',
    defaultMessage: 'Forums settings',
  },
  markPostAsAnswerSetting: {
    id: 'course.admin.forums.markPostAsAnswerSetting',
    defaultMessage: 'User who can mark a post as answer',
  },
  creatorOnly: {
    id: 'course.admin.forums.creatorOnly',
    defaultMessage: 'Creator only',
  },
  creatorOnlyDescription: {
    id: 'course.admin.forums.creatorOnlyDescription',
    defaultMessage:
      'Post creator (including staff) can mark/unmark a post as the correct answer.',
  },
  everyone: {
    id: 'course.admin.forums.everyone',
    defaultMessage: 'Everyone',
  },
  everyoneDescription: {
    id: 'course.admin.forums.everyoneDescription',
    defaultMessage:
      'Everyone (including staff) can mark/unmark a post as the correct answer.',
  },
});
