import CourseAPI from 'api/course';
import { DataHandle } from 'lib/hooks/router/dynamicNest';

const getForumTitle = async (forumId: string): Promise<string> => {
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
  const forumId = match.params?.forumId;
  if (!forumId) throw new Error(`Invalid forum id: ${forumId}`);

  return { getData: () => getForumTitle(forumId) };
};

export const forumTopicHandle: DataHandle = (match) => {
  const forumId = match.params?.forumId;
  if (!forumId) throw new Error(`Invalid forum id: ${forumId}`);

  const topicId = match.params?.topicId;
  if (!topicId) throw new Error(`Invalid topic id: ${topicId}`);

  return { getData: () => getTopicTitle(forumId, topicId) };
};
