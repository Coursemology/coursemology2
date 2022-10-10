import { AxiosResponse } from 'axios';
import { VideoSubmissionListData } from 'types/course/videoSubmissions';
import BaseCourseAPI from './Base';

export default class VideoSubmissionsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/users/${this.getCourseUserId()}/video_submissions`;
  }

  /**
   * Fetches a list of video submitted by a user in a course.
   */
  index(): Promise<
    AxiosResponse<{
      videoSubmissions: VideoSubmissionListData[];
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }
}
