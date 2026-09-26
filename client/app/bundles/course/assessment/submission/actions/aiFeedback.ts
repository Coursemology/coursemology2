// Publishing an assessment's draft AI feedback in bulk from the submissions page: feedback on students' code
// (Codaveri), which asks the publisher to rate it, and feedback on their written answers (rubric grading).
import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { CourseUserType } from 'lib/components/core/CourseUserTypeTabs';

import translations from '../translations';

interface DraftFeedbackCount {
  count: number;
}

export const fetchAssessmentAutoFeedbackCount = async (
  assessmentId: number,
  courseUsers: CourseUserType,
): Promise<DraftFeedbackCount> => {
  const response =
    await CourseAPI.assessment.assessments.fetchAutoFeedbackCount(
      assessmentId,
      courseUsers,
    );
  return response.data;
};

export const publishAssessmentAutoFeedback =
  (
    assessmentId: number,
    courseUsers: CourseUserType,
    rating: number,
  ): Operation =>
  (dispatch) =>
    CourseAPI.assessment.assessments
      .publishAutoFeedback(assessmentId, courseUsers, rating)
      .then(() => {
        dispatch(setNotification(translations.publishAutoFeedbackSuccess));
      })
      .catch((error) => {
        dispatch(setNotification(translations.requestFailure));
        // Rethrown so the caller doesn't treat the drafts as published.
        throw error;
      });

export const fetchAssessmentRubricFeedbackCount = async (
  assessmentId: number,
  courseUsers: CourseUserType,
): Promise<DraftFeedbackCount> => {
  const response =
    await CourseAPI.assessment.assessments.fetchRubricFeedbackCount(
      assessmentId,
      courseUsers,
    );
  return response.data;
};

export const publishAssessmentRubricFeedback =
  (assessmentId: number, courseUsers: CourseUserType): Operation =>
  (dispatch) =>
    CourseAPI.assessment.assessments
      .publishRubricFeedback(assessmentId, courseUsers)
      .then(() => {
        dispatch(setNotification(translations.publishRubricFeedbackSuccess));
      })
      .catch((error) => {
        dispatch(setNotification(translations.requestFailure));
        // Rethrown so the caller doesn't treat the drafts as published.
        throw error;
      });
