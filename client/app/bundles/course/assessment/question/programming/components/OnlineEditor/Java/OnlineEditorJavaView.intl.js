import { defineMessages } from 'react-intl';

export default defineMessages({
  prependSubtitle: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.prependSubtitle',
    defaultMessage:
      "For any library imports (optional, hidden, inserted before student's code)",
    description: 'Subtitle for prepend code block.',
  },
  appendSubtitle: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.appendSubtitle',
    defaultMessage:
      'Within the scope for the test class: Declare any methods or instance variables here',
    description: 'Subtitle for append code block.',
  },
  submitAsFileToggle: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.submitAsFileToggle',
    defaultMessage: 'File Submission',
  },
  submitAsFileToggleDisabled: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.submitAsFileToggleDisabled',
    defaultMessage:
      'File Submission (This option cannot be switched as some answers have already been submitted)',
  },
  addSubmissionFileButton: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.addSubmissionFileButton',
    defaultMessage: 'Add Submission File',
  },
  addSolutionFileButton: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.addSolutionFileButton',
    defaultMessage: 'Add Solution File',
  },
  submissionFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.submissionFilesHeader',
    defaultMessage: 'Submission Files',
    description: 'Header for the submission files of the online editor.',
  },
  solutionFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.solutionFilesHeader',
    defaultMessage: 'Solution Files',
    description: 'Header for the solution files of the online editor.',
  },
  newSubmissionFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.newSubmissionFilesHeader',
    defaultMessage: 'New Submission Files',
    description: 'Header for the new submission files panel.',
  },
  newSolutionFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.newSolutionFilesHeader',
    defaultMessage: 'New Solution Files',
    description: 'Header for the new solution files panel.',
  },
  currentSubmissionFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.currentSubmissionFilesHeader',
    defaultMessage: 'Current Submission Files',
    description: 'Header for the current submission files panel.',
  },
  currentSolutionFilesHeader: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.currentSolutionFilesHeader',
    defaultMessage: 'Current Solution Files',
    description: 'Header for the current solution files panel.',
  },
  testCaseDescriptionCode: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.testCaseDescriptionCode',
    defaultMessage: 'CODE',
    description:
      'Value of the code key that is passed into the test case description.',
  },
  testCaseDescriptionEditor: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.testCaseDescriptionEditor',
    defaultMessage: 'CODE EDITOR',
    description:
      'Value of the code key that is passed into the test case description.',
  },
  expectEquals: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.expectEquals',
    defaultMessage: 'void expectEquals(expression, expected)',
    description: 'Function template for expectEquals',
  },
  fileSubmissionDescriptionNote: {
    id: 'course.assessment.question.programming.OnlineEditorJavaView.fileSubmissionDescriptionNote',
    defaultMessage: 'File Submission',
    description:
      'Value of the key that is passed into the description of the file submission toggle.',
  },
});
