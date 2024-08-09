import { defineMessages } from 'react-intl';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

const translations = defineMessages({
  header: {
    id: 'course.discussion.topics.CommentIndex.comments',
    defaultMessage: 'Comments',
  },
});

export const commentHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;

  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.comments.index();

      return {
        activePath: `/courses/${courseId}/comments`,
        content: { title: data.settings.title || translations.header },
      };
    },
  };
};
