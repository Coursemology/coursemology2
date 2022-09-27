import { AxiosResponse } from 'axios';
import {
  VideoData,
  VideoListData,
  VideoMetadata,
  VideoPermissions,
  VideoTab,
} from 'types/course/videos';
import BaseVideoAPI from './Base';

export default class VideosAPI extends BaseVideoAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/videos`;
  }

  /**
   * Fetches a list of videos in a course.
   */
  index(currentTabId?: number): Promise<
    AxiosResponse<{
      videoTabs: VideoTab[];
      videos: VideoListData[];
      metadata: VideoMetadata;
      permissions: VideoPermissions;
    }>
  > {
    return this.getClient().get(this._getUrlPrefix(), {
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
    return this.getClient().get(`${this._getUrlPrefix()}/${videoId}`);
  }

  /**
   * Creates a video.
   */
  create(params: FormData): Promise<
    AxiosResponse<{
      videoTabs: VideoTab[];
      video: VideoData;
      showPersonalizedTimelineFeatures: boolean;
    }>
  > {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
   * Updates the video.
   */
  update(
    videoId: number,
    params: FormData | object,
  ): Promise<
    AxiosResponse<{
      videoTabs: VideoTab[];
      video: VideoData;
      showPersonalizedTimelineFeatures: boolean;
    }>
  > {
    return this.getClient().patch(`${this._getUrlPrefix()}/${videoId}`, params);
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
    return this.getClient().delete(`${this._getUrlPrefix()}/${videoId}`);
  }
}
