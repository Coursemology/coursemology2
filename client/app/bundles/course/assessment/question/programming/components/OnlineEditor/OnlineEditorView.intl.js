import { defineMessages } from 'react-intl';

export default defineMessages({
  prependTitle: {
    id: 'course.assessment.question.programming.OnlineEditorView.prependTitle',
    defaultMessage: 'Prepend',
    description: 'Title for prepend code block.',
  },
  prependSubtitle: {
    id: 'course.assessment.question.programming.OnlineEditorView.prependSubtitle',
    defaultMessage: "(optional, hidden, inserted before student's code)",
    description: 'Subtitle for prepend code block.',
  },
  appendTitle: {
    id: 'course.assessment.question.programming.OnlineEditorView.appendTitle',
    defaultMessage: 'Append',
    description: 'Title for append code block.',
  },
  appendSubtitle: {
    id: 'course.assessment.question.programming.OnlineEditorView.appendSubtitle',
    defaultMessage: "(optional, hidden, appended after student's code)",
    description: 'Subtitle for append code block.',
  },
  solutionTitle: {
    id: 'course.assessment.question.programming.OnlineEditorView.solutionTitle',
    defaultMessage: 'Solution Template',
    description: 'Title for solution template code block.',
  },
  solutionSubtitle: {
    id: 'course.assessment.question.programming.OnlineEditorView.solutionSubtitle',
    defaultMessage: '(optional, hidden, stores solution for future reference)',
    description: 'Subtitle for solution template code block.',
  },
  submissionTitle: {
    id: 'course.assessment.question.programming.OnlineEditorView.submissionTitle',
    defaultMessage: 'Submission Template',
    description: 'Title for submission template code block.',
  },
  testCasesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.testCasesHeader',
    defaultMessage: 'Test Cases',
    description: 'Header for the test cases of the online editor.',
  },
  dataFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.dataFilesHeader',
    defaultMessage: 'Data Files',
    description: 'Header for the data files of the online editor.',
  },
  currentDataFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.currentDataFilesHeader',
    defaultMessage: 'Current Data Files',
    description: 'Header for the current data files panel.',
  },
  addDataFileButton: {
    id: 'course.assessment.question.programming.OnlineEditorView.addDataFileButton',
    defaultMessage: 'Add Data File',
    description: 'Button for adding a new data file.',
  },
  fileNameHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.fileNameHeader',
    defaultMessage: 'File Name',
    description: 'Header for file name column in current data files panel.',
  },
  fileSizeHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.fileSizeHeader',
    defaultMessage: 'File Size',
    description: 'Header for file size column in current data files panel.',
  },
  newDataFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.newDataFilesHeader',
    defaultMessage: 'New Data Files',
    description: 'Header for the new data files panel.',
  },
  testCaseDescriptionNote: {
    id: 'course.assessment.question.programming.OnlineEditorView.testCaseDescriptionNote',
    defaultMessage: 'NOTE',
    description:
      'Value of the note key that is passed into the test case description.',
  },
  testCaseDescriptionPrint: {
    id: 'course.assessment.question.programming.OnlineEditorView.testCaseDescriptionPrint',
    defaultMessage: 'print()',
    description:
      'Value of the print key that is passed into the test case description.',
  },
  testCaseDescriptionNone: {
    id: 'course.assessment.question.programming.OnlineEditorView.testCaseDescriptionNone',
    defaultMessage: 'None',
    description:
      'Value of the none key that is passed into the test case description.',
  },
  testCaseDescriptionGoogleTest: {
    id: 'course.assessment.question.programming.OnlineEditorView.testCaseDescriptionGoogleTest',
    defaultMessage: 'Google Test Framework',
    description: "Name of Google's C++ test framework",
  },
  addNewTestButton: {
    id: 'course.assessment.question.programming.OnlineEditorView.addNewTestButton',
    defaultMessage: 'Add new test',
    description: 'Button for adding new test case.',
  },
  showTestCaseCodeEditorButton: {
    id: 'course.assessment.question.programming.OnlineEditorView.showTestCaseCodeEditorButton',
    defaultMessage: 'Code',
    description: 'Button for showing the test case inline code editor.',
  },
  hideTestCaseCodeEditorButton: {
    id: 'course.assessment.question.programming.OnlineEditorView.hideTestCaseCodeEditorButton',
    defaultMessage: 'Hide',
    description: 'Button for hiding the test case inline code editor.',
  },
  publicTestCases: {
    id: 'course.assessment.question.programming.OnlineEditorView.publicTestCases',
    defaultMessage: 'Public Test Cases',
    description: 'Title for public test cases panel.',
  },
  privateTestCases: {
    id: 'course.assessment.question.programming.OnlineEditorView.privateTestCases',
    defaultMessage: 'Private Test Cases',
    description: 'Title for private test cases panel.',
  },
  evaluationTestCases: {
    id: 'course.assessment.question.programming.OnlineEditorView.evaluationTestCases',
    defaultMessage: 'Evaluation Test Cases',
    description: 'Title for evaluation test cases panel.',
  },
  identifierHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.identifierHeader',
    defaultMessage: 'Identifier',
    description: 'Header for identifier column of test cases panel.',
  },
  expressionHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.expressionHeader',
    defaultMessage: 'Expression',
    description: 'Header for expression column of test cases panel.',
  },
  expectedHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.expectedHeader',
    defaultMessage: 'Expected',
    description: 'Header for expected column of test cases panel.',
  },
  hintHeader: {
    id: 'course.assessment.question.programming.OnlineEditorView.hintHeader',
    defaultMessage: 'Hint',
    description: 'Header for hint column of test cases panel.',
  },
  noTestCaseErrorAlert: {
    id: 'course.assessment.question.programming.OnlineEditorView.noTestCaseErrorAlert',
    defaultMessage:
      'At least 1 test case is required for autograded programming question.',
  },
  cannotBeBlankValidationError: {
    id: 'course.assessment.question.programming.OnlineEditorView.cannotBeBlankValidationError',
    defaultMessage: 'Cannot be blank.',
  },
  noSolutionTemplateError: {
    id: 'course.assessment.question.programming.OnlineEditorView.noSolutionTemplateError',
    defaultMessage:
      'For Codaveri to provide automated code correction, a solution code must be provided.',
  },
});
