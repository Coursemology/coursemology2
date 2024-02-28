import { RoomData, RoomsIndexData } from 'types/course/story/rooms';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class RoomsAPI extends BaseCourseAPI {
  #getUrlPrefix(storyId: number, id?: RoomData['id']): string {
    return `/courses/${this.courseId}/stories/${storyId}/rooms${
      id ? `/${id}` : ''
    }`;
  }

  index(storyId: number): APIResponse<RoomsIndexData> {
    return this.client.get(this.#getUrlPrefix(storyId));
  }

  fetch(storyId: number, id: RoomData['id']): APIResponse<RoomData> {
    return this.client.get(this.#getUrlPrefix(storyId, id));
  }

  sync(storyId: number, id: RoomData['id']): APIResponse<RoomData> {
    return this.client.patch(`${this.#getUrlPrefix(storyId, id)}/sync`);
  }
}
