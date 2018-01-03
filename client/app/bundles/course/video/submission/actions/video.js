import { sessionActionTypes, videoActionTypes } from 'lib/constants/videoConstants';
import CourseAPI from '../../../../../api/course/index';

/**
 * Creates action to change the playing state of the video player.
 *
 * @param playerState Should be one of playerStates in 'lib/constants/videoConstants.js'
 * @returns {{type: videoActionTypes, playerState: playerStates}} A change player state Redux action
 */
export function changePlayerState(playerState) {
  return {
    type: videoActionTypes.CHANGE_PLAYER_STATE,
    playerState,
  };
}

/**
 * Creates action to change the volume of the video player.
 *
 * @param playerVolume The new player volume, between 0 and 1.
 * @returns {{type: videoActionTypes, playerVolume: number}} A change volume Redux action
 */
export function changePlayerVolume(playerVolume) {
  let checkedPlayerVolume = playerVolume;
  checkedPlayerVolume = checkedPlayerVolume > 1 ? 1 : checkedPlayerVolume;
  checkedPlayerVolume = checkedPlayerVolume < 0 ? 0 : checkedPlayerVolume;

  return {
    type: videoActionTypes.CHANGE_PLAYER_VOLUME,
    playerVolume: checkedPlayerVolume,
  };
}

/**
 * Creates an action to change the playback rate.
 *
 * The playback rate should be one of videoDefaults.availablePlaybackRates, or any
 * playback rate supported by the intended player.
 *
 * @param playbackRate The new playback rate
 * @returns {{type: videoActionTypes, playbackRate: number}} A change playback rate Redux action
 */
export function changePlaybackRate(playbackRate) {
  return {
    type: videoActionTypes.CHANGE_PLAYBACK_RATE,
    playbackRate,
  };
}

/**
 * Creates an action to update the player progress.
 *
 * @param playerProgress The new player progress in seconds
 * @param forceSeek If the forceSeek flag should be set to force a player progress seek
 * @returns {{type: videoActionTypes, playerProgress: number, forceSeek: boolean}} An update player progress Redux
 * action
 */
export function updatePlayerProgress(playerProgress, forceSeek = false) {
  return {
    type: videoActionTypes.UPDATE_PLAYER_PROGRESS,
    playerProgress,
    forceSeek,
  };
}

/**
 * Creates an action to update the player buffer progress.
 *
 * @param bufferProgress The buffer progress in seconds
 * @returns {{type: videoActionTypes, bufferProgress: number}} An update buffer progress Redux action
 */
function updateBufferProgress(bufferProgress) {
  return {
    type: videoActionTypes.UPDATE_BUFFER_PROGRESS,
    bufferProgress,
  };
}

/**
 * Creates a thunk that updates both player progress and buffer progress as one.
 *
 * If either of the progress statistics are undefined, the corresponding action will not be dispatched.
 * @param playerProgress The new player progress in seconds
 * @param bufferProgress The buffer progress in seconds
 * @param forceSeek If the forceSeek flag should be set to force a player progress seek
 * @returns {function(dispatch)} The thunk to update player progress and buffer progress
 */
export function updateProgressAndBuffer(playerProgress, bufferProgress, forceSeek = false) {
  return (dispatch) => {
    if (playerProgress !== undefined) {
      dispatch(updatePlayerProgress(playerProgress, forceSeek));
    }

    if (bufferProgress !== undefined) {
      dispatch(updateBufferProgress(bufferProgress));
    }
  };
}

/**
 * Creates an action to update the total duration of the video.
 *
 * Video durations are not known at the start, and this action allows it to be updated dynamically.
 * @param duration The duration of the video
 * @returns {{type: videoActionTypes, duration: number}} A update duration Redux action
 */
export function updatePlayerDuration(duration) {
  return {
    type: videoActionTypes.UPDATE_PLAYER_DURATION,
    duration,
  };
}

/**
 * Creates an action to update the restricted time of the video.
 *
 * @param restrictContentAfter The point to restrict the video's content after in seconds
 * @returns {{type: videoActionTypes, restrictContentAfter: number}} A update restricted time Redux action
 */
export function updateRestrictedTime(restrictContentAfter) {
  return {
    type: videoActionTypes.UPDATE_RESTRICTED_TIME,
    restrictContentAfter,
  };
}

/**
 * Creates an action to denote that the user has started seeking.
 *
 * @return {{type: videoActionTypes}}
 */
export function seekStart() {
  return { type: videoActionTypes.SEEK_START };
}

/**
 * Creates an action to denote that the user has released the seek.
 * @return {{type: videoActionTypes}}
 */
export function seekEnd() {
  return { type: videoActionTypes.SEEK_END };
}

/**
 * Creates an action to remove events from the state store.
 * @param sequenceNums The event sequence numbers to remove
 * @return {{type: videoActionTypes, sequenceNums: Set<number>}}
 */
function removeEvents(sequenceNums) {
  return { type: sessionActionTypes.REMOVE_EVENTS, sequenceNums };
}

/**
 * Sends current events to the server.
 *
 * Events will be removed from the state store if the API call is successful.
 * @return {function(*, *)}
 */
export function sendEvents() {
  return (dispatch, getState) => {
    const videoState = getState().video;
    const sessionId = videoState.sessionId;

    if (sessionId === null) {
      return;
    }

    const events = videoState.sessionEvents;
    const videoTime = Math.round(videoState.playerProgress);

    CourseAPI.video.sessions
      .update(sessionId, videoTime, events.toArray())
      .then(() => {
        if (!events.isEmpty()) {
          dispatch(removeEvents(events.map(event => event.sequence_num).toSet()));
        }
      });
  };
}
