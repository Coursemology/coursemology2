import BaseVideoAPI from './Base';
import { getVideoId } from '../../../lib/helpers/url-helpers';

export default class SessionsAPI extends BaseVideoAPI {
  /**
   * event = {
   *   sequence_num: int
   *     - Sequence of event within session
   *   event_type: string
   *     - Either of 'play', 'pause', 'speed_change', 'seek_start', 'seek_end', 'buffer', or 'end'
   *   video_time: int
   *     - Video time when event occurred
   *   event_time: Date
   *     - Timestamp when event occurred
   *   playback_rate: float
   *     - The video playback rate
   */

  /**
   * Updates a video session.
   *
   * @param {number} id The session ID
   * @param {number} lastVideoTime The last video playback time as of function call
   * @param {Array} events The array of new events (as per shape above) to push to the server. Omit to only update
   * session end time
   * @return {Promise} The response from the server
   * success response: 204
   */
  update(id, lastVideoTime, events = []) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${id}`, {
      session: { last_video_time: lastVideoTime, events },
    });
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/videos/${getVideoId()}/sessions`;
  }
}
