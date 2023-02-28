import {
  TimeData,
  TimelineData,
  TimelinePostData,
  TimelinesData,
  TimePostData,
} from 'types/course/referenceTimelines';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class ReferenceTimelinesAPI extends BaseCourseAPI {
  #getUrlPrefix(id?: TimelineData['id']): string {
    return `/courses/${this.courseId}/timelines${id ? `/${id}` : ''}`;
  }

  index(): APIResponse<TimelinesData> {
    return this.client.get(this.#getUrlPrefix());
  }

  create(data: TimelinePostData): APIResponse<TimelineData> {
    return this.client.post(this.#getUrlPrefix(), data);
  }

  delete(
    id: TimelineData['id'],
    alternativeTimelineId?: TimelineData['id'],
  ): APIResponse {
    return this.client.delete(`${this.#getUrlPrefix(id)}`, {
      params: { revert_to: alternativeTimelineId },
    });
  }

  update(id: TimelineData['id'], data: TimelinePostData): APIResponse {
    return this.client.patch(`${this.#getUrlPrefix(id)}`, data);
  }

  createTime(
    id: TimelineData['id'],
    data: TimePostData,
  ): APIResponse<{ id: TimeData['id'] }> {
    return this.client.post(`${this.#getUrlPrefix(id)}/times`, data);
  }

  deleteTime(id: TimelineData['id'], timeId: TimeData['id']): APIResponse {
    return this.client.delete(`${this.#getUrlPrefix(id)}/times/${timeId}`);
  }

  updateTime(
    id: TimelineData['id'],
    timeId: TimeData['id'],
    data: TimePostData,
  ): APIResponse {
    return this.client.patch(`${this.#getUrlPrefix(id)}/times/${timeId}`, data);
  }
}
