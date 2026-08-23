import { defineMessages } from 'react-intl';

export default defineMessages({
  commentsSettings: {
    id: 'course.admin.CommentsSettings.commentsSettings',
    defaultMessage: 'Comments settings',
  },
  showAiGeneratedComments: {
    id: 'course.admin.CommentsSettings.showAiGeneratedComments',
    defaultMessage: 'Show AI-generated pending comments',
  },
  showAiGeneratedCommentsHint: {
    id: 'course.admin.CommentsSettings.showAiGeneratedCommentsHint',
    defaultMessage:
      "When disabled, topics awaiting review for AI-generated feedback are excluded from the 'Pending' and 'My Students Pending' tabs. The comments still appear normally elsewhere.",
  },
});
