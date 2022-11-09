import { AxiosResponse } from 'axios';
import {
  VideoEditSubmissionData,
  VideoSubmission,
  VideoSubmissionData,
} from 'types/course/video/submissions';

import BaseVideoAPI from './Base';

export default class SubmissionsAPI extends BaseVideoAPI {
  _getUrlPrefix(videoId?: number): string {
    const id = videoId ?? this.getVideoId();
    return `/courses/${this.getCourseId()}/videos/${id}/submissions`;
  }

  /**
   * Fetches a list of video submissions for a video in a course.
   */
  index(): Promise<AxiosResponse<VideoSubmission>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Fetch video submission in a course.
   */
  fetch(submissionId): Promise<AxiosResponse<VideoSubmissionData>> {
    return this.getClient().get(`${this._getUrlPrefix()}/${submissionId}`);
  }

  /**
   * Create a video submission in a course.
   */
  create(videoId: number): Promise<AxiosResponse<{ submissionId: number }>> {
    return this.getClient().post(`${this._getUrlPrefix(videoId)}`);
  }

  /**
   * Fetch edit video submission in a course.
   */
  edit(submissionId): Promise<AxiosResponse<VideoEditSubmissionData>> {
    return this.getClient().get(`${this._getUrlPrefix()}/${submissionId}/edit`);
  }
}
