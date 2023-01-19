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
  _getUrlPrefix(id?: TimelineData['id']): string {
    return `/courses/${this.getCourseId()}/timelines${id ? `/${id}` : ''}`;
  }

  index(): APIResponse<TimelinesData> {
    return this.getClient().get(this._getUrlPrefix());
  }

  create(data: TimelinePostData): APIResponse<TimelineData> {
    return this.getClient().post(this._getUrlPrefix(), data);
  }

  delete(
    id: TimelineData['id'],
    alternativeTimelineId?: TimelineData['id'],
  ): APIResponse {
    return this.getClient().delete(`${this._getUrlPrefix(id)}`, {
      params: { revert_to: alternativeTimelineId },
    });
  }

  update(id: TimelineData['id'], data: TimelinePostData): APIResponse {
    return this.getClient().patch(`${this._getUrlPrefix(id)}`, data);
  }

  createTime(
    id: TimelineData['id'],
    data: TimePostData,
  ): APIResponse<{ id: TimeData['id'] }> {
    return this.getClient().post(`${this._getUrlPrefix(id)}/times`, data);
  }

  deleteTime(id: TimelineData['id'], timeId: TimeData['id']): APIResponse {
    return this.getClient().delete(`${this._getUrlPrefix(id)}/times/${timeId}`);
  }

  updateTime(
    id: TimelineData['id'],
    timeId: TimeData['id'],
    data: TimePostData,
  ): APIResponse {
    return this.getClient().patch(
      `${this._getUrlPrefix(id)}/times/${timeId}`,
      data,
    );
  }
}
