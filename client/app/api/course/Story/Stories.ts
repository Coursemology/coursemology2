import {
  StoriesIndexData,
  StoryNewData,
  StoryShowData,
} from 'types/course/story/stories';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class StoriesAPI extends BaseCourseAPI {
  #getUrlPrefix(id?: number): string {
    return `/courses/${this.courseId}/stories${id ? `/${id}` : ''}`;
  }

  index(): APIResponse<StoriesIndexData> {
    return this.client.get(this.#getUrlPrefix());
  }

  fetch(id: number): APIResponse<StoryShowData> {
    return this.client.get(this.#getUrlPrefix(id));
  }

  fetchNew(): APIResponse<StoryNewData> {
    return this.client.get(`${this.#getUrlPrefix()}/new`);
  }

  delete(id: number): APIResponse<unknown> {
    return this.client.delete(this.#getUrlPrefix(id));
  }
}
