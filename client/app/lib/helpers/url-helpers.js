/* Get the given parameter from the URL.
 * e.g. With this URL -> http://dummy.com/?technology=jquery&blog=jquerybyexample
 *
 * var tech = getUrlParameter('technology');
 * var blog = getUrlParameter('blog');
 *
 * Taken from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
 */
function getUrlParameter(sParam) {
  const sPageURL = decodeURIComponent(window.location.search.substring(1));
  const sURLVariables = sPageURL.split('&');
  let sParameterName;

  for (let i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? '' : sParameterName[1];
    }
  }
  return '';
}

/**
 * Get the course id from URL.
 *
 * return {number}
 */
function getCourseId() {
  const match = window.location.pathname.match(/^\/courses\/(\d+)/);
  return match && match[1];
}

/**
 * Get the survey id from URL.
 *
 * return {number}
 */
function getSurveyId() {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/surveys\/(\d+)/,
  );
  return match && match[1];
}

/**
 * Get the achievement id from URL.
 *
 * return {number}
 */
function getAchievementId() {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/achievements\/(\d+)/,
  );
  return match && match[1];
}

/**
 * Get the assessment id from URL.
 *
 * return {number}
 */
function getAssessmentId() {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/(\d+)/,
  );
  return match && match[1];
}

/**
 * Get the submission id from URL.
 *
 * return {number}
 */
function getSubmissionId() {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/\d+\/submissions\/(\d+)/,
  );
  return match && match[1];
}

/**
 * Get the scribing id from URL.
 *
 * return {number}
 */
function getScribingId() {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/\d+\/question\/scribing\/(\d+)/,
  );
  return match && match[1];
}

/**
 * Get the video id from URL.
 *
 * @returns {number}
 */
function getVideoId() {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/videos\/(\d+)/,
  );
  return match && match[1];
}

/**
 * Get the course user id from URL.
 *
 * return {number}
 */
function getCourseUserId() {
  const match = window.location.pathname.match(/^\/courses\/\d+\/users\/(\d+)/);
  return match && match[1];
}

/**
 * Get the video submission id from URL.
 *
 * return {number}
 */
function getVideoSubmissionId() {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/videos\/\d+\/submissions\/(\d+)/,
  );
  return match && match[1];
}

/**
 * Get the current path from URL.
 *
 * e.g. /courses/15/users/invite
 * return {string}
 */
function getCurrentPath() {
  const match = window.location.pathname.match(/(^\/courses\/\d+\/.+)/);
  return match && match[1];
}

export {
  getAchievementId,
  getAssessmentId,
  getCourseId,
  getCourseUserId,
  getCurrentPath,
  getScribingId,
  getSubmissionId,
  getSurveyId,
  getUrlParameter,
  getVideoId,
  getVideoSubmissionId,
};
