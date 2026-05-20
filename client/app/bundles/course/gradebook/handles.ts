import { defineMessages } from 'react-intl';

import type { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

const translations = defineMessages({
  header: {
    id: 'course.gradebook.GradebookIndex.gradebook',
    defaultMessage: 'Gradebook',
  },
});

export const gradebookHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;

  return {
    getData: async (): Promise<CrumbPath> => ({
      activePath: `/courses/${courseId}/gradebook`,
      content: { title: translations.header },
    }),
  };
};
