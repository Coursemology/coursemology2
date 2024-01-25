import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { DataHandle } from 'lib/hooks/router/dynamicNest';

export const storyHandle: DataHandle = (match) => {
  const storyId = getIdFromUnknown(match.params?.storyId);
  if (!storyId) throw new Error(`Invalid story id: ${storyId}`);

  return {
    getData: async (): Promise<string> => {
      const response = await CourseAPI.stories.stories.fetch(storyId);
      return response.data.title;
    },
  };
};
