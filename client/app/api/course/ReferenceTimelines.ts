import { AxiosResponse } from 'axios';
import {
  TimeData,
  TimelineData,
  TimelinePostData,
  TimelinesData,
  TimePostData,
} from 'types/course/referenceTimelines';

import BaseCourseAPI from './Base';

type Response<Result = void> = Promise<AxiosResponse<Result>>;

export default class ReferenceTimelinesAPI extends BaseCourseAPI {
  _getUrlPrefix(id?: TimelineData['id']): string {
    return `/courses/${this.getCourseId()}/timelines${id ? `/${id}` : ''}`;
  }

  index(): Response<TimelinesData> {
    return this.getClient().get(this._getUrlPrefix());
  }

  create(data: TimelinePostData): Response<TimelineData> {
    return this.getClient().post(this._getUrlPrefix(), data);
  }

  delete(
    id: TimelineData['id'],
    alternativeTimelineId?: TimelineData['id'],
  ): Response {
    return this.getClient().delete(`${this._getUrlPrefix(id)}`, {
      params: { revert_to: alternativeTimelineId },
    });
  }

  update(id: TimelineData['id'], data: TimelinePostData): Response {
    return this.getClient().patch(`${this._getUrlPrefix(id)}`, data);
  }

  createTime(
    id: TimelineData['id'],
    data: TimePostData,
  ): Response<{ id: TimeData['id'] }> {
    return this.getClient().post(`${this._getUrlPrefix(id)}/times`, data);
  }

  deleteTime(id: TimelineData['id'], timeId: TimeData['id']): Response {
    return this.getClient().delete(`${this._getUrlPrefix(id)}/times/${timeId}`);
  }

  updateTime(
    id: TimelineData['id'],
    timeId: TimeData['id'],
    data: TimePostData,
  ): Response {
    return this.getClient().patch(
      `${this._getUrlPrefix(id)}/times/${timeId}`,
      data,
    );
  }
}
