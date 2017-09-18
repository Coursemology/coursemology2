/**
 * Formats a number into a timestamp string.
 *
 * @param {number} timestamp The timestamp in seconds.
 *
 * return {string} The timestamp formatted in [hh:]mm:ss
 */
function formatTimestamp(timestamp) {
  const hour = Math.floor(timestamp / 3600);
  const minute = Math.floor((timestamp % 3600) / 60);
  const seconds = Math.round((timestamp % 3600) % 60);

  return (
    `${(hour > 0 ? `${hour}:${minute < 10 ? '0' : ''}` : '') +
    minute}:${seconds < 10 ? '0' : ''}${seconds}`
  );
}

function timeIsPastRestricted(restrictedTimeInSec, timeInSec) {
  if (!restrictedTimeInSec || restrictedTimeInSec <= 0) {
    return false;
  }

  return timeInSec >= restrictedTimeInSec;
}

export { formatTimestamp, timeIsPastRestricted };
