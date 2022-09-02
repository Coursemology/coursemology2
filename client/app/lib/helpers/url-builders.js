export const getUserURL = (userId) => `/users/${userId}`;

export const getCourseURL = (courseId) => `/courses/${courseId}`;

export const getCourseAnnouncementURL = (courseId, announcementId) =>
  `/courses/${courseId}/announcements/${announcementId}`;

export const getCourseUserURL = (courseId, courseUserId) =>
  `/courses/${courseId}/users/${courseUserId}`;

export const getAchievementURL = (courseId, achievementId) =>
  `/courses/${courseId}/achievements/${achievementId}`;

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

export const getForumTopicURL = (courseId, forumSlug, topicSlug) =>
  `/courses/${courseId}/forums/${forumSlug}/topics/${topicSlug}`;

export const getSkillsURL = (courseId) =>
  `/courses/${courseId}/assessments/skills`;
export const getSurveyURL = (courseId, surveyId) =>
  `/courses/${courseId}/surveys/${surveyId}`;

export const getSurveyResponseURL = (courseId, surveyId, responseId) =>
  `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}/edit`;

export const getAssessmentURL = (courseId, assessmentId) =>
  `/courses/${courseId}/assessments/${assessmentId}`;

export const getAssessmentSubmissionURL = (courseId, assessmentId) =>
  `/courses/${courseId}/assessments/${assessmentId}/submissions`;

export const getAssessmentAttemptURL = (courseId, assessmentId) =>
  `/courses/${courseId}/assessments/${assessmentId}/attempt`;

export const getEditAssessmentSubmissionURL = (
  courseId,
  assessmentId,
  submissionId,
) =>
  `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;

export const getVideoURL = (courseId, videoId) =>
  `/courses/${courseId}/videos/${videoId}`;

export const getVideoSubmissionsURL = (courseId, videoId) =>
  `/courses/${courseId}/videos/${videoId}/submissions`;

export const getVideoAttemptURL = (courseId, videoId) =>
  `/courses/${courseId}/videos/${videoId}/attempt`;

export const getIgnoreTodoURL = (courseId, todoId) =>
  `/courses/${courseId}/lesson_plan/todos/${todoId}/ignore`;

export const getRegistrationURL = (courseId) => `/courses/${courseId}/register`;

export const getEnrolRequestURL = (courseId) =>
  `/courses/${courseId}/enrol_requests`;

export const getWorkbinFolderURL = (courseId, folderId) =>
  `/courses/${courseId}/materials/folders/${folderId}`;

export const getWorkbinFileURL = (courseId, folderId, fileId) =>
  `/courses/${courseId}/materials/folders/${folderId}/files/${fileId}`;
