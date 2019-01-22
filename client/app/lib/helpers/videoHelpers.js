import { playerStates } from '../constants/videoConstants';

/**
 * Formats a number into a timestamp string.
 *
 * @param {number} timestamp The timestamp in seconds.
 *
 * return {string} The timestamp formatted in [hh:]mm:ss
 */
function formatTimestamp(timestamp) {
  if (timestamp < 0) {
    timestamp = 0;
  }
  const roundedTime = Math.round(timestamp);
  const hour = Math.floor(roundedTime / 3600);
  const minute = Math.floor((roundedTime % 3600) / 60);
  const seconds = (roundedTime % 3600) % 60;

  return (
    `${(hour > 0 ? `${hour}:${minute < 10 ? '0' : ''}` : '')
    + minute}:${seconds < 10 ? '0' : ''}${seconds}`
  );
}

/**
 * Checks if the time given is past the restricted time.
 *
 * If restricted time is invalid (<0 or undefined), this function will always return false.
 * @param restrictedTimeInSec The time denoting the maximum allowed content
 * @param timeInSec The time to test
 * @returns {boolean} true if timeInSec exceeds restrictedTimeInSec
 */
function timeIsPastRestricted(restrictedTimeInSec, timeInSec) {
  if (restrictedTimeInSec === undefined || restrictedTimeInSec <= 0) {
    return false;
  }

  return timeInSec >= restrictedTimeInSec;
}

/**
 * Returns true if the playerState provided is considered a state when the  player will continue playing the video
 * whenever possible.
 * @param playerState The playerState to check against playerStates
 * @returns {boolean} If the playerState provided is a playing state
 */
function isPlayingState(playerState) {
  return playerState === playerStates.PLAYING || playerState === playerStates.BUFFERING;
}

/**
 * Extracts Youtube query params from video URL and compares with video duration
 * to get effective start and end seconds.
 */
function getProperStartEnd(youtubeUrl, videoDuration) {
  var result = { startSecond: 0, endSecond: videoDuration };
  var query = youtubeUrl.split('?')[1];
  if (query === undefined) {
    return result;
  }
  query.split('&').forEach(function(part) {
    var item = part.split('=');
    if (item[0] === 'start') {
      result['startSecond'] = Math.max(
        parseInt(decodeURIComponent(item[1])),
        result['startSecond']
      );
    } else if (item[0] === 'end') {
      result['endSecond'] = Math.min(
        parseInt(decodeURIComponent(item[1])),
        result['endSecond']
      );
    }
  });
  return result;
}

export {
  formatTimestamp,
  timeIsPastRestricted,
  isPlayingState,
  getProperStartEnd
};
