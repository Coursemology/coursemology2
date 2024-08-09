import { defineMessages } from 'react-intl';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

const translations = defineMessages({
  header: {
    id: 'course.announcements.AnnouncementsIndex.header',
    defaultMessage: 'Announcements',
  },
});

export const announcementsHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;

  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.announcements.index();

      return {
        activePath: `/courses/${courseId}/announcements`,
        content: { title: data.announcementTitle || translations.header },
      };
    },
  };
};
