import { defineMessages } from 'react-intl';

export default defineMessages({
  titleFieldLabel: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.titleFieldLabel',
    defaultMessage: 'Title',
    description: 'Label for the title input field.',
  },
  descriptionFieldLabel: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.descriptionFieldLabel',
    defaultMessage: 'Description',
    description: 'Label for the description input field.',
  },
  staffOnlyCommentsFieldLabel: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.staffOnlyCommentsFieldLabel',
    defaultMessage: 'Staff only comments',
    description: 'Label for the staff only comments input field.',
  },
  maximumGradeFieldLabel: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.maximumGradeFieldLabel',
    defaultMessage: 'Maximum Grade',
    description: 'Label for the maximum grade input field.',
  },
  skillsFieldLabel: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.skillsFieldLabel',
    defaultMessage: 'Skills',
    description: 'Label for the skills input field.',
  },
  noFileChosenMessage: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.noFileChosenMessage',
    defaultMessage: 'No file chosen',
    description:
      'Message to be displayed when no file is chosen for a file input.',
  },
  chooseFileButton: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.chooseFileButton',
    defaultMessage: 'Choose File',
    description: 'Button for adding an image attachment.',
  },
  fetchFailureMessage: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.fetchFailureMessage',
    defaultMessage: 'An error occurred, please try again.',
  },
  submitButton: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.submitButton',
    defaultMessage: 'Submit',
    description: 'Button for submitting the form.',
  },
  submitFailureMessage: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.submitFailureMessage',
    defaultMessage: 'An error occurred, please try again.',
  },
  submittingMessage: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.submittingMessage',
    defaultMessage: 'Submitting...',
    description:
      'Text to be displayed when waiting for server response after form submission.',
  },
  resolveErrorsMessage: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.resolveErrorsMessage',
    defaultMessage: 'This form has errors, please resolve before submitting.',
  },
  cannotBeBlankValidationError: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.cannotBeBlankValidationError',
    defaultMessage: 'Cannot be blank.',
  },
  positiveNumberValidationError: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.positiveNumberValidationError',
    defaultMessage: 'Value must be positive.',
  },
  valueMoreThanEqual1000Error: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.valueMoreThan1000Error',
    defaultMessage: 'Value must be less than 1000.',
  },
  lessThanEqualZeroValidationError: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.lessThanEqualZeroValidationError',
    defaultMessage: 'Value must be greater than 0.',
  },
  scribingQuestionWarning: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.scribingQuestionWarning',
    defaultMessage:
      'NOTE: Each page of a PDF file will be created as a single Scribing question \
    with every question taking on the same question details. \
    You can choose to leave the optional inputs blank and return to edit the questions again after creation.',
  },
  fileAttachmentRequired: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.fileAttachmentRequired',
    defaultMessage: 'File attachment required.',
  },
  fileUploaded: {
    id: 'course.assessment.question.scribing.ScribingQuestionForm.fileUploaded',
    defaultMessage: 'File uploaded:',
  },
});
