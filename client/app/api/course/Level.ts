import { APIResponse } from 'api/types';
import { LevelsData } from 'course/level/types';

import BaseCourseAPI from './Base';

export default class LevelAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/levels`;
  }

  fetch(): APIResponse<LevelsData> {
    return this.client.get(`${this.#urlPrefix}`);
  }

  save(levelFields: number[]): APIResponse<void> {
    return this.client.post(this.#urlPrefix, { levels: levelFields });
  }
}
