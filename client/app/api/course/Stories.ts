import { APIResponse, JustRedirect } from 'api/types';

import BaseCourseAPI from './Base';

export default class StoriesAPI extends BaseCourseAPI {
  learn(): APIResponse<JustRedirect> {
    return this.client.get(`/courses/${this.courseId}/learn`);
  }

  missionControl(): APIResponse<JustRedirect> {
    return this.client.get(`/courses/${this.courseId}/mission_control`);
  }
}
