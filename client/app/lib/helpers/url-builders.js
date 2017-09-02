export const getCourseUserURL = (courseId, courseUserId) =>
  `/courses/${courseId}/users/${courseUserId}`;

export const getEditSubmissionURL = (courseId, assessmentId, submissionId) =>
  `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;

export const getSubmissionLogsURL = (courseId, assessmentId, submissionId) =>
  `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/logs`;
