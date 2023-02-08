import { defineMessages } from 'react-intl';

export default defineMessages({
  autograded: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.autograded',
    defaultMessage: 'Evaluate and Test Code',
  },
  autogradedAssessment: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.autogradedAssessment',
    defaultMessage:
      'Answers to non-evaluation type programming questions will always receive the maximum grade',
  },
  autogradedToggleDisabled: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.autogradedToggleDisabled',
    defaultMessage:
      'This question cannot be switched to non-evaluation type as some answers have already been submitted',
  },
  titleFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.titleFieldLabel',
    defaultMessage: 'Title',
    description: 'Label for the title input field.',
  },
  descriptionFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.descriptionFieldLabel',
    defaultMessage: 'Description',
    description: 'Label for the description input field.',
  },
  staffOnlyCommentsFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.staffOnlyCommentsFieldLabel',
    defaultMessage: 'Staff only comments',
    description: 'Label for the staff only comments input field.',
  },
  maximumGradeFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.maximumGradeFieldLabel',
    defaultMessage: 'Maximum Grade',
    description: 'Label for the maximum grade input field.',
  },
  skillsFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.skillsFieldLabel',
    defaultMessage: 'Skills',
    description: 'Label for the skills input field.',
  },
  languageFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.languageFieldLabel',
    defaultMessage: 'Language',
    description: 'Label for the language input field.',
  },
  memoryLimitFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.memoryLimitFieldLabel',
    defaultMessage: 'Memory Limit (MB)',
    description: 'Label for the memory limit input field.',
  },
  timeLimitFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.timeLimitFieldLabel',
    defaultMessage: 'Time Limit (s)',
    description: 'Label for the time limit input field.',
  },
  attemptLimitFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.attemptLimitFieldLabel',
    defaultMessage: 'Attempt Limit',
    description: 'Label for the attempt limit input field.',
  },
  templatePackageFieldLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.templatePackageFieldLabel',
    defaultMessage: 'Template Package',
    description: 'Label for the template package input field.',
  },
  attemptLimitPlaceholderMessage: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.attemptLimitPlaceholderMessage',
    defaultMessage:
      'The maximum times that the students can test their answers (does not apply to staff)',
    description: 'Placeholder message for attempt limit input field.',
  },
  uploadedPackageLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.uploadedPackageLabel',
    defaultMessage: 'Uploaded package',
    description: 'Label for the existing uploaded zip package.',
  },
  downloadPackageLabel: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.downloadPackageLabel',
    defaultMessage: 'Download package',
    description: 'Label for the downloading generated zip package.',
  },
  packageUpdatedBy: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.packageUpdatedBy',
    defaultMessage: 'Updated by: {name}',
    description:
      'Shows the author who last modified the package through the online editor.',
  },
  packageUploadedBy: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.packageUploadedBy',
    defaultMessage: 'Uploaded by: {name}',
    description: 'Shows the author who last uploaded the zip package.',
  },
  newPackageButton: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.newPackageButton',
    defaultMessage: 'Choose new package',
    description: 'Button for uploading new zip package.',
  },
  noFileChosenMessage: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.noFileChosenMessage',
    defaultMessage: 'No file chosen',
    description:
      'Message to be displayed when no file is chosen for a file input.',
  },
  editTestsOnlineButton: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.editTestsOnlineButton',
    defaultMessage: 'Use Test Case Editor',
    description: 'Button for editing tests online.',
  },
  uploadPackageButton: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.uploadPackageButton',
    defaultMessage: 'Upload Package',
    description: 'Button for uploading package.',
  },
  submitButton: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.submitButton',
    defaultMessage: 'Submit',
    description: 'Button for submitting the form.',
  },
  submitButtonTooltip: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.submitButtonTooltip',
    defaultMessage:
      'Unable to update Codaveri question type as there are existing submissions',
  },
  submitFailureMessage: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.submitFailureMessage',
    defaultMessage: 'An error occurred, please try again.',
  },
  evaluatingMessage: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.evaluatingMessage',
    defaultMessage: 'Evaluating',
    description:
      'Text to be displayed when evaluating the programming question.',
  },
  loadingMessage: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.loadingMessage',
    defaultMessage: 'Loading',
    description:
      'Text to be displayed when waiting for server response after form submission.',
  },
  resolveErrorsMessage: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.resolveErrorsMessage',
    defaultMessage: 'This form has errors, please resolve before submitting.',
  },
  cannotBeBlankValidationError: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.cannotBeBlankValidationError',
    defaultMessage: 'Cannot be blank.',
  },
  noPackageValidationError: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.noPackageValidationError',
    defaultMessage: 'Package file required.',
  },
  positiveNumberValidationError: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.positiveNumberValidationError',
    defaultMessage: 'Value must be positive.',
  },
  lessThanEqualZeroValidationError: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.lessThanEqualZeroValidationError',
    defaultMessage: 'Value must be greater than 0.',
  },
  timeLimitRangeValidationError: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.timeLimitRangeValidationError',
    defaultMessage: 'Time limit must be within 1 to {hard_time_limit}.',
  },
  submitConfirmation: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.submitConfirmation',
    defaultMessage:
      'There are existing submissions for this autograded question.\
      Updating this question will re-grade all submitted answers to this question and\
      only system-issued EXP for the submissions will be re-calculated.\
      Note that manually-issued EXP will not be updated.\
      Are you sure you wish to continue?',
  },
  chooseEvaluator: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.chooseEvaluator',
    defaultMessage: 'For code evaluation, use:',
  },
  defaultEvaluator: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.defaultEvaluator',
    defaultMessage: 'Default Evaluator',
  },
  codaveriEvaluator: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.codaveriEvaluator',
    defaultMessage: 'Codaveri Evaluator & Feedback (Experimental Feature)',
  },
  codaveriTooltip: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.codaveriTooltip',
    defaultMessage:
      "Codaveri provides code evaluation and automated code feedback services for students' codes. \
      (Note that the code feedback is only provided upon finalising submissions).",
  },
  disableCodaveriTooltip: {
    id: 'course.assessment.question.programming.ProgrammingQuestionForm.disableCodaveriTooltip',
    defaultMessage:
      "Codaveri provides code evaluation and automated code feedback services for students' codes. \
      This feature is currently disabled. To use it, please enable this component in the course/instance setting.",
  },
});
