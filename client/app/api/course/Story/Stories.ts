import { StoriesIndexData, StoryData } from 'types/course/story/stories';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class StoriesAPI extends BaseCourseAPI {
  #getUrlPrefix(id?: StoryData['id']): string {
    return `/courses/${this.courseId}/stories${id ? `/${id}` : ''}`;
  }

  index(): APIResponse<StoriesIndexData> {
    return this.client.get(this.#getUrlPrefix());
  }

  fetch(id: StoryData['id']): APIResponse<StoryData> {
    return this.client.get(this.#getUrlPrefix(id));
  }
}
