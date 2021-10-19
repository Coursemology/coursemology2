export const getCourseUserURL = (courseId, courseUserId) =>
  `/courses/${courseId}/users/${courseUserId}`;

export const getEditSubmissionURL = (courseId, assessmentId, submissionId) =>
  `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;

export const getSubmissionLogsURL = (courseId, assessmentId, submissionId) =>
  `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/logs`;

export const getProgrammingFileURL = (
  courseId,
  assessmentId,
  submissionId,
  answerId,
  fileId,
) =>
  `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}` +
  `/answers/${answerId}/programming/files/${fileId}/download`;

export const getForumURL = (courseId, forumID) =>
  `/courses/${courseId}/forums/${forumID}`;

export const getForumTopicURL = (courseId, forumID, topicId) =>
  `/courses/${courseId}/forums/${forumID}/topics/${topicId}`;
