import BaseVideoAPI from './Base';
import { getVideoId } from '../../../lib/helpers/url-helpers';

export default class SessionsAPI extends BaseVideoAPI {
  /**
   * event = {
   *   sequence_num: int
   *     - Sequence of event within session
   *   event_type: string
   *     - Either of 'play', 'pause', 'seek', or 'speed_change'
   *   video_time_initial: int
   *     - Video time when event started
   *   video_time_final: int
   *     - Video time when event ended
   *   event_time: Date
   *     - Timestamp when event occurred
   */

  /**
   * Updates a video session.
   *
   * @param {number} id The session ID
   * @param {Array} events The array of new events (as per shape above) to push to the server. Omit to only update
   * session end time
   * @return {Promise} The response from the server
   * success response: 204
   */
  update(id, events = []) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${id}`, { session: { events } });
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/videos/${getVideoId()}/sessions`;
  }
}
