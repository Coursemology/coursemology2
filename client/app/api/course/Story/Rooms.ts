import { RoomData, RoomsIndexData } from 'types/course/story/rooms';
import { StoryData } from 'types/course/story/stories';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class RoomsAPI extends BaseCourseAPI {
  #getUrlPrefix(storyId: StoryData['id'], id?: RoomData['id']): string {
    return `/courses/${this.courseId}/stories/${storyId}/rooms${
      id ? `/${id}` : ''
    }`;
  }

  index(storyId: StoryData['id']): APIResponse<RoomsIndexData> {
    return this.client.get(this.#getUrlPrefix(storyId));
  }

  fetch(storyId: StoryData['id'], id: RoomData['id']): APIResponse<RoomData> {
    return this.client.get(this.#getUrlPrefix(storyId, id));
  }

  sync(storyId: StoryData['id'], id: RoomData['id']): APIResponse<RoomData> {
    return this.client.patch(`${this.#getUrlPrefix(storyId, id)}/sync`);
  }
}
