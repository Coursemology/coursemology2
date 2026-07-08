/* Get the given parameter from the URL.
 * e.g. With this URL -> http://dummy.com/?technology=jquery&blog=jquerybyexample
 *
 * var tech = getUrlParameter('technology');
 * var blog = getUrlParameter('blog');
 *
 * Taken from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
 */
function getUrlParameter(sParam: string): string {
  const sPageURL = decodeURIComponent(window.location.search.substring(1));
  const sURLVariables = sPageURL.split('&');
  let sParameterName: string[];

  for (let i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? '' : sParameterName[1];
    }
  }
  return '';
}

function getCourseIdFromString(str: string): string | null {
  const match = str.match(/\/courses\/(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Get the course id from URL.
 */
function getCourseId(): string | null {
  return getCourseIdFromString(window.location.pathname);
}

/**
 * Get the survey id from URL.
 */
function getSurveyId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/surveys\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the achievement id from URL.
 */
function getAchievementId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/achievements\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the assessment id from URL.
 */
function getAssessmentId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the (abstract) question id from URL.
 */
function getQuestionId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/\d+\/question\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the submission id from URL.
 */
function getSubmissionId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/\d+\/submissions\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the scribing id from URL.
 */
function getScribingId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/\d+\/question\/scribing\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the video id from URL.
 */
function getVideoId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/videos\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the course user id from URL.
 */
function getCourseUserId(): string | null {
  const match = window.location.pathname.match(/^\/courses\/\d+\/users\/(\d+)/);
  return match?.[1] ?? null;
}

function getSubmissionQuestionId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/assessments\/\d+\/submission_questions\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the video submission id from URL.
 */
function getVideoSubmissionId(): string | null {
  const match = window.location.pathname.match(
    /^\/courses\/\d+\/videos\/\d+\/submissions\/(\d+)/,
  );
  return match?.[1] ?? null;
}

/**
 * Get the current path from URL.
 *
 * e.g. /courses/15/users/invite
 */
function getCurrentPath(): string | null {
  const match = window.location.pathname.match(/(^\/courses\/\d+\/.+)/);
  return match?.[1] ?? null;
}

export {
  getAchievementId,
  getAssessmentId,
  getCourseId,
  getCourseIdFromString,
  getCourseUserId,
  getCurrentPath,
  getQuestionId,
  getScribingId,
  getSubmissionId,
  getSubmissionQuestionId,
  getSurveyId,
  getUrlParameter,
  getVideoId,
  getVideoSubmissionId,
};
