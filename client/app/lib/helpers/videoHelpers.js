import { playerStates } from '../constants/videoConstants';

/**
 * Formats a number into a timestamp string.
 *
 * @param {number} timestamp The timestamp in seconds.
 *
 * return {string} The timestamp formatted in [hh:]mm:ss
 */
function formatTimestamp(timestamp) {
  const roundedTime = Math.round(timestamp);
  const hour = Math.floor(roundedTime / 3600);
  const minute = Math.floor((roundedTime % 3600) / 60);
  const seconds = (roundedTime % 3600) % 60;

  return `${(hour > 0 ? `${hour}:${minute < 10 ? '0' : ''}` : '') + minute}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
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
  return (
    playerState === playerStates.PLAYING ||
    playerState === playerStates.BUFFERING
  );
}

export { formatTimestamp, timeIsPastRestricted, isPlayingState };
