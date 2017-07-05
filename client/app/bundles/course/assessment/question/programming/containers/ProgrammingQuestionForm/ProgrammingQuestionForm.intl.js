import { defineMessages } from 'react-intl';

export default defineMessages({
  autograded: {
    id: 'course.assessment.question.programming.onlineEditorView.autograded',
    defaultMessage: 'Autograded',
  },
  autogradedAssessment: {
    id: 'course.assessment.question.programming.onlineEditorView.autogradedAssessment',
    defaultMessage: 'Answers to non-autograded programming questions will always receive the maximum grade',
  },
  autogradedToggleDisabled: {
    id: 'course.assessment.question.programming.onlineEditorView.autogradedToggleDisabled',
    defaultMessage: 'This question cannot be switched to non-autograded as some answers have already been submitted',
  },
  titleFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.titleFieldLabel',
    defaultMessage: 'Title',
    description: 'Label for the title input field.',
  },
  descriptionFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.descriptionFieldLabel',
    defaultMessage: 'Description',
    description: 'Label for the description input field.',
  },
  staffOnlyCommentsFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.staffOnlyCommentsFieldLabel',
    defaultMessage: 'Staff only comments',
    description: 'Label for the staff only comments input field.',
  },
  maximumGradeFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.maximumGradeFieldLabel',
    defaultMessage: 'Maximum Grade',
    description: 'Label for the maximum grade input field.',
  },
  skillsFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.skillsFieldLabel',
    defaultMessage: 'Skills',
    description: 'Label for the skills input field.',
  },
  languageFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.languageFieldLabel',
    defaultMessage: 'Language',
    description: 'Label for the language input field.',
  },
  memoryLimitFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.memoryLimitFieldLabel',
    defaultMessage: 'Memory Limit (MB)',
    description: 'Label for the memory limit input field.',
  },
  timeLimitFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.timeLimitFieldLabel',
    defaultMessage: 'Time Limit (s)',
    description: 'Label for the time limit input field.',
  },
  attemptLimitFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.attemptLimitFieldLabel',
    defaultMessage: 'Attempt Limit',
    description: 'Label for the attempt limit input field.',
  },
  templatePackageFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.templatePackageFieldLabel',
    defaultMessage: 'Template Package',
    description: 'Label for the template package input field.',
  },
  attemptLimitPlaceholderMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.attemptLimitPlaceholderMessage',
    defaultMessage: 'The maximum times that the students can test their answers (does not apply to staff)',
    description: 'Placeholder message for attempt limit input field.',
  },
  uploadedPackageLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.uploadedPackageLabel',
    defaultMessage: 'Uploaded package',
    description: 'Label for the existing uploaded zip package.',
  },
  downloadPackageLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.downloadPackageLabel',
    defaultMessage: 'Download package',
    description: 'Label for the downloading generated zip package.',
  },
  packageUpdatedBy: {
    id: 'course.assessment.question.programming.programmingQuestionForm.packageUpdatedBy',
    defaultMessage: 'Updated by: {name}',
    description: 'Shows the author who last modified the package through the online editor.',
  },
  packageUploadedBy: {
    id: 'course.assessment.question.programming.programmingQuestionForm.packageUploadedBy',
    defaultMessage: 'Uploaded by: {name}',
    description: 'Shows the author who last uploaded the zip package.',
  },
  newPackageButton: {
    id: 'course.assessment.question.programming.programmingQuestionForm.newPackageButton',
    defaultMessage: 'Choose new package',
    description: 'Button for uploading new zip package.',
  },
  noFileChosenMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.noFileChosenMessage',
    defaultMessage: 'No file chosen',
    description: 'Message to be displayed when no file is chosen for a file input.',
  },
  editTestsOnlineButton: {
    id: 'course.assessment.question.programming.programmingQuestionForm.editTestsOnlineButton',
    defaultMessage: 'Use Test Case Editor',
    description: 'Button for editing tests online.',
  },
  uploadPackageButton: {
    id: 'course.assessment.question.programming.programmingQuestionForm.uploadPackageButton',
    defaultMessage: 'Upload Package',
    description: 'Button for uploading package.',
  },
  submitButton: {
    id: 'course.assessment.question.programming.programmingQuestionForm.submitButton',
    defaultMessage: 'Submit',
    description: 'Button for submitting the form.',
  },
  submitFailureMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.submitFailureMessage',
    defaultMessage: 'An error occurred, please try again.',
  },
  evaluatingMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.evaluatingMessage',
    defaultMessage: 'Evaluating',
    description: 'Text to be displayed when evaluating the programming question.',
  },
  loadingMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.loadingMessage',
    defaultMessage: 'Loading',
    description: 'Text to be displayed when waiting for server response after form submission.',
  },
  resolveErrorsMessage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.resolveErrorsMessage',
    defaultMessage: 'This form has errors, please resolve before submitting.',
  },
  cannotBeBlankValidationError: {
    id: 'course.assessment.question.programming.programmingQuestionForm.cannotBeBlankValidationError',
    defaultMessage: 'Cannot be blank.',
  },
  noPackageValidationError: {
    id: 'course.assessment.question.programming.programmingQuestionForm.noPackageValidationError',
    defaultMessage: 'Package file required.',
  },
  positiveNumberValidationError: {
    id: 'course.assessment.question.programming.programmingQuestionForm.positiveNumberValidationError',
    defaultMessage: 'Value must be positive.',
  },
  lessThanEqualZeroValidationError: {
    id: 'course.assessment.question.programming.programmingQuestionForm.lessThanEqualZeroValidationError',
    defaultMessage: 'Value must be greater than 0.',
  },
  timeLimitRangeValidationError: {
    id: 'course.assessment.question.programming.programmingQuestionForm.timeLimitRangeValidationError',
    defaultMessage: 'Time limit must be within 1 to 30.',
  },
});
