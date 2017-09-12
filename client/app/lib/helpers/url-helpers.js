/* eslint-disable max-len */
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
      return sParameterName[1] === undefined ? true : sParameterName[1];
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
  const match = window.location.pathname.match(/^\/courses\/\d+\/surveys\/(\d+)/);
  return match && match[1];
}

/**
 * Get the assessment id from URL.
 *
 * return {number}
 */
function getAssessmentId() {
  const match = window.location.pathname.match(/^\/courses\/\d+\/assessments\/(\d+)/);
  return match && match[1];
}

/**
 * Get the submission id from URL.
 *
 * return {number}
 */
function getSubmissionId() {
  const match = window.location.pathname.match(/^\/courses\/\d+\/assessments\/\d+\/submissions\/(\d+)/);
  return match && match[1];
}

/**
 * Get the scribing id from URL.
 *
 * return {number}
 */
function getScribingId() {
  const match = window.location.pathname.match(/^\/courses\/\d+\/assessments\/\d+\/question\/scribing\/(\d+)/);
  return match && match[1];
}

/* eslint-disable import/prefer-default-export */
export { getUrlParameter, getCourseId, getSurveyId, getAssessmentId, getSubmissionId, getScribingId };
