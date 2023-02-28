import BaseVideoAPI from './Base';

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
   * Creates a new video session.
   * @return {Promise} The response from the server.
   * success response: {
   *    id: string,
   * }
   */
  create() {
    return this.client.post(this.#urlPrefix);
  }

  /**
   * Updates a video session.
   *
   * @param {number} id The session ID
   * @param {number} lastVideoTime The last video playback time as of function call
   * @param {Array} events The array of new events (as per shape above) to push to the server. Omit to only update
   * session end time
   * @param isOldSession true if we're updating a old session
   * @return {Promise} The response from the server
   * success response: 204
   */
  update(
    id,
    lastVideoTime,
    events = [],
    duration = 0,
    isOldSession = false,
    closeSession = false,
  ) {
    return this.client.patch(`${this.#urlPrefix}/${id}`, {
      session: { last_video_time: lastVideoTime, events },
      is_old_session: isOldSession,
      video_duration: duration,
      close_session: closeSession,
    });
  }

  get #urlPrefix() {
    return `/courses/${
      this.courseId
    }/videos/${this.getVideoId()}/submissions/${this.getVideoSubmissionId()}/sessions`;
  }
}
