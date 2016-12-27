import { defineMessages } from 'react-intl';

export const programmingQuestionFormTranslations = defineMessages({
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
    defaultMessage: 'Memory Limit',
    description: 'Label for the memory limit input field.',
},
  timeLimitFieldLabel: {
    id: 'course.assessment.question.programming.programmingQuestionForm.timeLimitFieldLabel',
    defaultMessage: 'Time Limit',
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
  downloadPackage: {
    id: 'course.assessment.question.programming.programmingQuestionForm.downloadPackage',
    defaultMessage: 'Download Package',
    description: 'Label for downloading the zip package.',
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
});

export const onlineEditorPythonViewTranslations = defineMessages({
  prependTitle: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.prependTitle',
    defaultMessage: 'Prepend',
    description: 'Title for prepend code block.',
  },
  appendTitle: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.appendTitle',
    defaultMessage: 'Append',
    description: 'Title for append code block.',
  },
  solutionTitle: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.solutionTitle',
    defaultMessage: 'Solution Template',
    description: 'Title for solution template code block.',
  },
  submissionTitle: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.submissionTitle',
    defaultMessage: 'Submission Template',
    description: 'Title for submission template code block.',
  },
  publicTestCases: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.publicTestCases',
    defaultMessage: 'Public Test Cases',
    description: 'Title for public test cases panel.',
  },
  privateTestCases: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.privateTestCases',
    defaultMessage: 'Private Test Cases',
    description: 'Title for private test cases panel.',
  },
  evaluationTestCases: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.evaluationTestCases',
    defaultMessage: 'Evaluation Test Cases',
    description: 'Title for evaluation test cases panel.',
  },
  identifierHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.identifierHeader',
    defaultMessage: 'Identifier',
    description: 'Header for identifier column of test cases panel.',
  },
  expressionHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.expressionHeader',
    defaultMessage: 'Expression',
    description: 'Header for expression column of test cases panel.',
  },
  expectedHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.expectedHeader',
    defaultMessage: 'Expected',
    description: 'Header for expected column of test cases panel.',
  },
  hintHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.hintHeader',
    defaultMessage: 'Hint',
    description: 'Header for hint column of test cases panel.',
  },
  addNewTestButton: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.addNewTestButton',
    defaultMessage: 'Add new test',
    description: 'Button for adding new test case.',
  },
});

export const buildLogTranslations = defineMessages({
  header: {
    id: 'course.assessment.question.programming.buildLog.header',
    defaultMessage: 'Build Log',
    description: 'Header for build log.',
  },
  stdoutHeader: {
    id: 'course.assessment.question.programming.buildLog.stdoutHeader',
    defaultMessage: 'Standard Output',
    description: 'Header for standard output.',
  },
  stderrHeader: {
    id: 'course.assessment.question.programming.buildLog.stderrHeader',
    defaultMessage: 'Standard Error',
    description: 'Header for standard error.',
  },
});

export const onlineEditorTranslations = defineMessages({
  selectLanguageAlert: {
    id: 'course.assessment.question.programming.onlineEditor.selectLanguageAlert',
    defaultMessage: 'Please select a language.',
    description: 'Alert message to be displayed when no language is selected.',
  },
  notYetImplementedAlert: {
    id: 'course.assessment.question.programming.onlineEditor.notYetImplementedAlert',
    defaultMessage: 'Not yet implemented :(',
    description: 'Alert message to be displayed when selected language does not have an online editor.',
  },
});

export const uploadedPackageViewer = defineMessages({
  templateHeader: {
    id: 'course.assessment.question.programming.uploadedPackageViewer.templateHeader',
    defaultMessage: 'Template',
    description: 'Header for submission template of the uploaded package.',
  },
  testCasesHeader: {
    id: 'course.assessment.question.programming.uploadedPackageViewer.testCasesHeader',
    defaultMessage: 'Test Cases',
    description: 'Header for the test cases of the uploaded package.',
  },
});
