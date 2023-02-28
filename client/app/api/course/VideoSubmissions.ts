import { AxiosResponse } from 'axios';
import { VideoSubmissionListData } from 'types/course/videoSubmissions';

import BaseCourseAPI from './Base';

export default class VideoSubmissionsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/users/${this.courseUserId}/video_submissions`;
  }

  /**
   * Fetches a list of video submitted by a user in a course.
   */
  index(): Promise<
    AxiosResponse<{
      videoSubmissions: VideoSubmissionListData[];
    }>
  > {
    return this.client.get(this.#urlPrefix);
  }
}
