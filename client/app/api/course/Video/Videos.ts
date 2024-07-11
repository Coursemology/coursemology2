import { AxiosResponse } from 'axios';
import {
  VideoData,
  VideoListData,
  VideoMetadata,
  VideoPatchData,
  VideoPatchPublishData,
  VideoPermissions,
  VideoPostData,
  VideoTab,
} from 'types/course/videos';

import BaseVideoAPI from './Base';

export default class VideosAPI extends BaseVideoAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/videos`;
  }

  /**
   * Fetches a list of videos in a course.
   */
  index(currentTabId?: number): Promise<
    AxiosResponse<{
      videoTitle: string;
      videoTabs: VideoTab[];
      videos: VideoListData[];
      metadata: VideoMetadata;
      permissions: VideoPermissions;
    }>
  > {
    return this.client.get(this.#urlPrefix, {
      params: { tab: currentTabId },
    });
  }

  /**
   * Fetches a video.
   */
  fetch(videoId: number): Promise<
    AxiosResponse<{
      videoTabs: VideoTab[];
      video: VideoData;
      showPersonalizedTimelineFeatures: boolean;
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/${videoId}`);
  }

  /**
   * Creates a video.
   */
  create(params: VideoPostData): Promise<
    AxiosResponse<{
      videoTabs: VideoTab[];
      video: VideoData;
      showPersonalizedTimelineFeatures: boolean;
    }>
  > {
    return this.client.post(this.#urlPrefix, params);
  }

  /**
   * Updates the video.
   */
  update(
    videoId: number,
    params: VideoPatchData | VideoPatchPublishData,
  ): Promise<
    AxiosResponse<{
      videoTabs: VideoTab[];
      video: VideoData;
      showPersonalizedTimelineFeatures: boolean;
    }>
  > {
    return this.client.patch(`${this.#urlPrefix}/${videoId}`, params);
  }

  /**
   * Deletes a video.
   *
   * @param {number} videoId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(videoId: number): Promise<AxiosResponse> {
    return this.client.delete(`${this.#urlPrefix}/${videoId}`);
  }
}
