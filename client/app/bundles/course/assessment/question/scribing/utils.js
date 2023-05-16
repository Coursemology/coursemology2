import { getAssessmentId, getCourseId } from 'lib/helpers/url-helpers';
import history from 'lib/history';

/**
 * Redirects to the assessment show page.
 */
export const redirectToAssessment = () => {
  history.push(`/courses/${getCourseId()}/assessments/${getAssessmentId()}`);
  window.location.href = `/courses/${getCourseId()}/assessments/${getAssessmentId()}`;
};

// Helper function to process form fields before create/update
export const processFields = (fields) => {
  // Deep clone JSON fields
  const parsedFields = JSON.parse(JSON.stringify(fields));

  // Modify the structure of `parsedFields` so it matches what non React forms
  // pass to the Rails backend.
  parsedFields.question_assessment = {};
  if (fields.skill_ids.length < 1) {
    parsedFields.question_assessment.skill_ids = [''];
  } else {
    parsedFields.question_assessment.skill_ids = parsedFields.skill_ids;
  }

  if (fields.attachment) {
    parsedFields.file = fields.attachment.file;
  } else {
    delete parsedFields.file;
  }

  delete parsedFields.attachment;
  delete parsedFields.skill_ids;

  return { question_scribing: parsedFields };
};

export const buildInitialValues = (scribingQuestion) =>
  scribingQuestion.question
    ? {
        title: scribingQuestion.question.title || '',
        description: scribingQuestion.question.description || '',
        staff_only_comments:
          scribingQuestion.question.staff_only_comments || '',
        maximum_grade: scribingQuestion.question.maximum_grade || '',
        skill_ids: scribingQuestion.question.skill_ids,
        attachment: scribingQuestion.question.attachment || {},
      }
    : {
        title: '',
        description: '',
        staff_only_comments: '',
        maximum_grade: '',
        skill_ids: [],
        attachment: {},
      };
