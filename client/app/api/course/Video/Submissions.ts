import {
  VideoEditSubmissionData,
  VideoSubmission,
  VideoSubmissionAttemptData,
  VideoSubmissionData,
} from 'types/course/video/submissions';

import { APIResponse } from 'api/types';

import BaseVideoAPI from './Base';

export default class SubmissionsAPI extends BaseVideoAPI {
  #getUrlPrefix(videoId?: number): string {
    const id = videoId ?? this.getVideoId();
    return `/courses/${this.courseId}/videos/${id}/submissions`;
  }

  /**
   * Fetches a list of video submissions for a video in a course.
   */
  index(): APIResponse<VideoSubmission> {
    return this.client.get(this.#getUrlPrefix());
  }

  /**
   * Fetch video submission in a course.
   */
  fetch(submissionId: number): APIResponse<VideoSubmissionData> {
    return this.client.get(`${this.#getUrlPrefix()}/${submissionId}`);
  }

  /**
   * Create a video submission in a course.
   */
  create(videoId: number): APIResponse<VideoSubmissionAttemptData> {
    return this.client.post(`${this.#getUrlPrefix(videoId)}`);
  }

  /**
   * Fetch edit video submission in a course.
   */
  edit(submissionId: number): APIResponse<VideoEditSubmissionData> {
    return this.client.get(`${this.#getUrlPrefix()}/${submissionId}/edit`);
  }

  /**
   * Programmatically attempts to watch a video and get the submission URL.
   * Created as a compatibility method for `NextVideoButton`.
   *
   * @param url URL in the form of `courses/:id/videos/:id/attempt`
   * @returns
   */
  attempt(url: string): APIResponse<VideoSubmissionAttemptData> {
    return this.client.get(url);
  }
}
