import { defineMessages } from 'react-intl';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

const translations = defineMessages({
  header: {
    id: 'course.forum.ForumsIndex.header',
    defaultMessage: 'Forums',
  },
});

const getForumName = async (forumId: string): Promise<string> => {
  const response = await CourseAPI.forum.forums.fetch(forumId);
  return response.data.forum.name;
};

const getTopicTitle = async (
  forumId: string,
  topicId: string,
): Promise<string> => {
  const response = await CourseAPI.forum.topics.fetch(forumId, topicId);
  return response.data.topic.title;
};

export const forumHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;

  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.forum.forums.index();

      return {
        activePath: `/courses/${courseId}/forums`,
        content: {
          title: data.forumTitle || translations.header,
          url: `forums`,
        },
      };
    },
  };
};

export const forumNameHandle: DataHandle = (match) => {
  const forumId = match.params?.forumId;
  if (!forumId) throw new Error(`Invalid forum id: ${forumId}`);

  return { getData: () => getForumName(forumId) };
};

export const forumTopicHandle: DataHandle = (match) => {
  const forumId = match.params?.forumId;
  if (!forumId) throw new Error(`Invalid forum id: ${forumId}`);

  const topicId = match.params?.topicId;
  if (!topicId) throw new Error(`Invalid topic id: ${topicId}`);

  return { getData: () => getTopicTitle(forumId, topicId) };
};
