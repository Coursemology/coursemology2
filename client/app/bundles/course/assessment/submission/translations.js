import { defineMessages } from 'react-intl';

const translations = defineMessages({
  studentView: {
    id: 'course.assessment.submission.studentView',
    defaultMessage: 'Student View',
  },
  unstarted: {
    id: 'course.assessment.submission.unstarted',
    defaultMessage: 'Not Started',
  },
  attempting: {
    id: 'course.assessment.submission.attempting',
    defaultMessage: 'Attempting',
  },
  submitted: {
    id: 'course.assessment.submission.submitted',
    defaultMessage: 'Submitted',
  },
  graded: {
    id: 'course.assessment.submission.graded',
    defaultMessage: 'Graded but not published',
  },
  published: {
    id: 'course.assessment.submission.published',
    defaultMessage: 'Graded',
  },
  submissionBy: {
    id: 'course.assessment.submission.submissionBy',
    defaultMessage: 'Submission by {submitter}',
  },
  saveDraft: {
    id: 'course.assessment.submission.saveDraft',
    defaultMessage: 'Save Draft',
  },
  saveGrade: {
    id: 'course.assessment.submission.saveGrade',
    defaultMessage: 'Save Grade',
  },
  finalise: {
    id: 'course.assessment.submission.finalise',
    defaultMessage: 'Finalise Submission',
  },
  unsubmit: {
    id: 'course.assessment.submission.unsubmit',
    defaultMessage: 'Unsubmit Submission',
  },
  mark: {
    id: 'course.assessment.submission.mark',
    defaultMessage: 'Submit for Publishing',
  },
  unmark: {
    id: 'course.assessment.submission.unmark',
    defaultMessage: 'Revert to Submitted',
  },
  publish: {
    id: 'course.assessment.submission.publish',
    defaultMessage: 'Publish Grade',
  },
  autograde: {
    id: 'course.assessment.submission.autograde',
    defaultMessage: 'Evaluate Answers',
  },
  submit: {
    id: 'course.asssessment.submission.submit',
    defaultMessage: 'Submit',
  },
  submitTooltip: {
    id: 'course.assessment.submission.submitShortcut',
    defaultMessage: '(Ctrl+Enter) or (⌘+Enter)',
  },
  runCode: {
    id: 'course.assessment.submission.runCode',
    defaultMessage: 'Run Code',
  },
  runCodeWithLimit: {
    id: 'course.assessment.submission.runCodeWithLimit',
    defaultMessage:
      'Run Code ({attemptsLeft, plural, one {# attempt} other {# attempts}} left)',
  },
  reset: {
    id: 'course.assessment.submission.reset',
    defaultMessage: 'Reset Answer',
  },
  continue: {
    id: 'course.assessment.submission.continue',
    defaultMessage: 'Continue',
  },
  student: {
    id: 'course.assessment.submission.student',
    defaultMessage: 'Name',
  },
  status: {
    id: 'course.assessment.submission.status',
    defaultMessage: 'Submission Status',
  },
  totalGrade: {
    id: 'course.assessment.submission.totalGrade',
    defaultMessage: 'Total Grade',
  },
  expAwarded: {
    id: 'course.assessment.submission.expAwarded',
    defaultMessage: 'Experience Points Awarded',
  },
  grader: {
    id: 'course.assessment.submission.grader',
    defaultMessage: 'Grader',
  },
  bonusEndAt: {
    id: 'course.assessment.submission.bonusEndAt',
    defaultMessage: 'Bonus End At',
  },
  dueAt: {
    id: 'course.assessment.submission.dueAt',
    defaultMessage: 'Due At',
  },
  attemptedAt: {
    id: 'course.assessment.submission.attemptedAt',
    defaultMessage: 'Attempted At',
  },
  submittedAt: {
    id: 'course.assessment.submission.submittedAt',
    defaultMessage: 'Submitted At',
  },
  gradedAt: {
    id: 'course.assessment.submission.gradedAt',
    defaultMessage: 'Graded At',
  },
  multiplier: {
    id: 'course.assessment.submission.multiplier',
    defaultMessage: 'Multiplier',
  },
  question: {
    id: 'course.assessment.submission.question',
    defaultMessage: 'Question',
  },
  questionNumber: {
    id: 'course.assessment.submission.questionNumber',
    defaultMessage: 'Q{number}',
  },
  loadingComment: {
    id: 'course.assessment.submission.loadingComment',
    defaultMessage: 'Loading comment field...',
  },
  comments: {
    id: 'course.assessment.submission.comments',
    defaultMessage: 'Comments',
  },
  correct: {
    id: 'course.assessment.submission.correct',
    defaultMessage: 'Correct!',
  },
  wrong: {
    id: 'course.assessment.submission.wrong',
    defaultMessage: 'Wrong!',
  },
  publicTestCaseFailure: {
    id: 'course.assessment.submission.publicTestCaseFailure',
    defaultMessage: 'Your code fails one or more public test cases.',
  },
  privateTestCaseFailure: {
    id: 'course.assessment.submission.privateTestCaseFailure',
    defaultMessage: 'Your code fails one or more private test cases.',
  },
  submitConfirmation: {
    id: 'course.assessment.submission.submitConfirmation',
    defaultMessage:
      'THIS ACTION IS IRREVERSIBLE Are you sure you want to submit? \
                    You will no longer be able to amend your submission!',
  },
  unsubmitConfirmation: {
    id: 'course.assessment.submission.unsubmitConfirmation',
    defaultMessage:
      'This will reset the submission time and permit the student to change \
                    their submission. NOTE THAT YOU CANNOT UNDO THIS!! Are you sure you want to proceed?',
  },
  submitError: {
    id: 'course.assessment.submission.submitError',
    defaultMessage:
      'Failure to submit answer. Please check the errors for your answers',
  },
  resetConfirmation: {
    id: 'course.assessment.submission.resetConfirmation',
    defaultMessage:
      'Are you sure you want to reset your answer? This action is irreversible \
                    and you will lose all your current work for this question.',
  },
  publishConfirmation: {
    id: 'course.assessment.submission.publishConfirmation',
    defaultMessage:
      'Are you sure you want to publish all {graded} graded submissions ({selectedUsers})? \
                    THIS ACTION IS IRREVERSIBLE! \
                    All graded submissions will be published and users will be able to see their own grades.',
  },
  forceSubmitConfirmation: {
    id: 'course.assessment.submission.forceSubmitConfirmation',
    defaultMessage:
      'There are currently {unattempted} unattempted \
      and {attempting} attempting user(s) ({selectedUsers}) for this assessment. \
      Are you sure you want to force submit all submissions? \
      Doing so will cause all questions to be awarded ZERO marks for non-autograded assessments. \
      NOTE THAT THIS ACTION IS IRREVERSIBLE!',
  },
  forceSubmitConfirmationAutograded: {
    id: 'course.assessment.submission.forceSubmitConfirmationAutograded',
    defaultMessage:
      'There are currently {unattempted} unattempted \
      and {attempting} attempting user(s) ({selectedUsers}) for this assessment. \
      Are you sure you want to force submit all submissions? \
      Submissions to this assessment will be auto-graded. \
      NOTE THAT THIS ACTION IS IRREVERSIBLE!',
  },
  sendReminderEmailConfirmation: {
    id: 'course.assessment.submission.sendReminderEmailConfirmation',
    defaultMessage:
      'Send reminder emails to {unattempted} unattempted \
      and {attempting} attempting user(s) ({selectedUsers}) \
      who have not completed the assessment?',
  },
  unsubmitAllConfirmation: {
    id: 'course.assessment.submission.unsubmitAllConfirmation',
    defaultMessage:
      'Are you sure you want to UNSUBMIT the submissions for all {users}? \
                    All submissions will be unsubmitted and this will reset the submission time \
                    and permit the users to change their submissions. NOTE THAT THIS ACTION IS IRREVERSIBLE',
  },
  deleteAllConfirmation: {
    id: 'course.assessment.submission.deleteAllConfirmation',
    defaultMessage:
      'Are you sure you want to DELETE the submissions for all {users}? \
                    All answers, past attempts, and submissions will be deleted \
                    and users will need to re-attempt all questions. NOTE THAT THIS ACTION IS IRREVERSIBLE',
  },
  lateSubmission: {
    id: 'course.assessment.submission.lateSubmission',
    defaultMessage:
      'This submission is LATE! You may want to penalize the student for late submission.',
  },
  unpublishedGrades: {
    id: 'course.assessment.submission.unpublishedGrades',
    defaultMessage:
      'These grades will not be visible to the student until they are published. \
                    This can be done at the submissions page of this assessment.',
  },
  updateSuccess: {
    id: 'course.assessment.submission.updateSuccess',
    defaultMessage: 'Submission updated successfully.',
  },
  updateFailure: {
    id: 'course.assessment.submission.updateFailure',
    defaultMessage: 'Submission update failed: {errors}',
  },
  downloadRequestSuccess: {
    id: 'course.assessment.submission.downloadRequestSuccess',
    defaultMessage: 'Your download request is successful.',
  },
  requestFailure: {
    id: 'course.assessment.submission.requestFailure',
    defaultMessage: 'An error occurred while processing your request.',
  },
  deleteFileSuccess: {
    id: 'course.assessment.submission.deleteFileSuccess',
    defaultMessage: 'File deleted successfully',
  },
  deleteFileFailure: {
    id: 'course.assessment.submission.deleteFileFailure',
    defaultMessage: 'File deletion failed: {errors}',
  },
  importFilesSuccess: {
    id: 'course.assessment.submission.importFilesSuccess',
    defaultMessage: 'Files uploaded successfully.',
  },
  importFilesFailure: {
    id: 'course.assessment.submission.importFilesFailure',
    defaultMessage: 'File uploads failed: {errors}',
  },
  invalidJavaFileUpload: {
    id: 'course.assessment.submission.invalidFileUpload',
    defaultMessage: 'File uploads failed: Only java files can be uploaded',
  },
  similarFileNameExists: {
    id: 'course.assessment.submission.similarFileNameExists',
    defaultMessage: 'File uploads failed: File already exists',
  },
  uploadFiles: {
    id: 'course.assessment.submission.uploadFiles',
    defaultMessage: 'Upload Files',
  },
  autogradeFailure: {
    id: 'course.assessment.submission.autogradeFailure',
    defaultMessage:
      '(T_T) Sorry, the autograder is having mood swings and quit on us. \
                    Try submitting your code again in a couple of minutes.',
  },
  autogradeSubmissionSuccess: {
    id: 'course.assessment.submission.autogradeSubmissionSuccess',
    defaultMessage: 'All answers have been evaluated.',
  },
  autogradeSubmissionFailure: {
    id: 'course.assessment.submission.autogradeSubmissionFailure',
    defaultMessage: 'An error occurred while evaluating the answers.',
  },
  publishJobPending: {
    id: 'course.assessment.submission.publishJobPending',
    defaultMessage:
      'Please wait as the submissions are currently being published.',
  },
  publishSuccess: {
    id: 'course.assessment.submission.publishSuccess',
    defaultMessage: 'All graded submissions above have been published.',
  },
  forceSubmitJobPending: {
    id: 'course.assessment.submission.forceSubmitJobPending',
    defaultMessage:
      'Please wait as the submissions are currently being created and/or submitted.',
  },
  forceSubmitSuccess: {
    id: 'course.assessment.submission.forceSubmitSuccess',
    defaultMessage:
      'All unsubmitted submissions above have been successfully submitted and graded.',
  },
  sendReminderEmailSuccess: {
    id: 'course.assessment.assessments.sendReminderEmailSuccess',
    defaultMessage:
      'Closing assessment reminder emails have been successfully dispatched.',
  },
  downloadSubmissionsJobPending: {
    id: 'course.assessment.submission.downloadSubmissionsJobPending',
    defaultMessage:
      'Please wait as your request to download submission answers is being processed.',
  },
  downloadStatisticsJobPending: {
    id: 'course.assessment.submission.downloadStatisticsJobPending',
    defaultMessage:
      'Please wait as your request to download submission statistics is being processed.',
  },
  unsubmitSubmissionSuccess: {
    id: 'course.assessment.submission.unsubmitSubmissionSuccess',
    defaultMessage: "{name}'s submission has been successfully unsubmitted.",
  },
  unsubmitAllSubmissionsJobPending: {
    id: 'course.assessment.submission.unsubmitAllSubmissionsJobPending',
    defaultMessage:
      'Please wait as the submissions are currently being unsubmitted.',
  },
  unsubmitAllSubmissionsSuccess: {
    id: 'course.assessment.submission.unsubmitAllSubmissionsSuccess',
    defaultMessage: 'All submissions above have been successfully unsubmitted.',
  },
  deleteSubmissionSuccess: {
    id: 'course.assessment.submission.deleteSubmissionSuccess',
    defaultMessage: "{name}'s submission has been successfully deleted.",
  },
  deleteAllSubmissionsJobPending: {
    id: 'course.assessment.submission.deleteAllSubmissionsJobPending',
    defaultMessage:
      'Please wait as the submissions are currently being deleted.',
  },
  deleteAllSubmissionsSuccess: {
    id: 'course.assessment.submission.deleteAllSubmissionsSuccess',
    defaultMessage: 'All submissions above have been successfully deleted.',
  },
  examDialogTitle: {
    id: 'course.assessment.submission.examDialogTitle',
    defaultMessage: 'You are entering an exam.',
  },
  examDialogMessage: {
    id: 'course.assessment.submission.examDialogMessage',
    defaultMessage:
      'Please do not sign out or close the browser, otherwise \
                    you may have trouble continuing the exam.',
  },
  emptyAssessment: {
    id: 'course.assessment.submission.emptyAssessment',
    defaultMessage: 'This assessment currently has no questions.',
  },
  submitNoQuestionExplain: {
    id: 'course.asssessment.submission.submitNoQuestionExplain',
    defaultMessage: 'Mark as completed?',
  },
  ok: {
    id: 'course.assessment.submission.ok',
    defaultMessage: 'OK',
  },
  answerSubmitted: {
    id: 'course.assessment.submission.answerSubmitted',
    defaultMessage: 'Answer Submitted',
  },
  noAnswerSelected: {
    id: 'course.assessment.submission.noAnswerSelected',
    defaultMessage: 'You have not selected any past answers.',
  },
  pastAnswers: {
    id: 'course.assessment.submission.pastAnswers',
    defaultMessage: 'Past Answers',
  },
  getPastAnswersFailure: {
    id: 'course.assessment.submission.getPastAnswersFailure',
    defaultMessage: 'Failed to load past answers',
  },
  statistics: {
    id: 'course.assessment.submission.statistics',
    defaultMessage: 'Statistics',
  },
  gradeSummary: {
    id: 'course.assessment.submission.gradeSummary',
    defaultMessage: 'Grade Summary',
  },
  rendererNotImplemented: {
    id: 'course.assessment.submission.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
  solutions: {
    id: 'course.assessment.submission.solutions',
    defaultMessage: 'Solutions',
  },
  solutionsWithMaximumGrade: {
    id: 'course.assessment.submission.solutionsWithMaximumGrade',
    defaultMessage:
      'Solutions (Maximum Grade for this Question: {maximumGrade})',
  },
  type: {
    id: 'course.assessment.submission.type',
    defaultMessage: 'Type',
  },
  solution: {
    id: 'course.assessment.submission.solution',
    defaultMessage: 'Solution',
  },
  information: {
    id: 'course.assessment.submission.information',
    defaultMessage: 'Word from Text Passage',
  },
  grade: {
    id: 'course.assessment.submission.grade',
    defaultMessage: 'Grade',
  },
  group: {
    id: 'course.assessment.submission.group',
    defaultMessage: 'Group',
  },
  point: {
    id: 'course.assessment.submission.point',
    defaultMessage: 'Point',
  },
  maximumGroupGrade: {
    id: 'course.assessment.submission.maximumGroupGrade',
    defaultMessage: 'Maximum Grade for this Group',
  },
  pointGrade: {
    id: 'course.assessment.submission.pointGrade',
    defaultMessage: 'Grade for this Point',
  },
  solutionLemma: {
    id: 'course.assessment.submission.solutionLemma',
    defaultMessage: 'Solution (lemma form for autograding)',
  },
  expandComments: {
    id: 'course.assessment.submission.readOnlyEditor.expandComments',
    defaultMessage: 'Expand all comments',
  },
  showCommentsPanel: {
    id: 'course.assessment.submission.readOnlyEditor.showCommentsPanel',
    defaultMessage: 'Show comments panel',
  },
});

export const scribingTranslations = defineMessages({
  colour: {
    id: 'course.assessment.submission.answer.scribing.colour',
    defaultMessage: 'Colour:',
  },
  fontFamily: {
    id: 'course.assessment.submission.answer.scribing.fontFamily',
    defaultMessage: 'Font Family:',
  },
  arial: {
    id: 'course.assessment.submission.answer.scribing.arial',
    defaultMessage: 'Arial',
  },
  arialBlack: {
    id: 'course.assessment.submission.answer.scribing.arialBlack',
    defaultMessage: 'Arial Black',
  },
  comicSansMs: {
    id: 'course.assessment.submission.answer.scribing.comicSansMs',
    defaultMessage: 'Comic Sans MS',
  },
  georgia: {
    id: 'course.assessment.submission.answer.scribing.georgia',
    defaultMessage: 'Georgia',
  },
  impact: {
    id: 'course.assessment.submission.answer.scribing.impact',
    defaultMessage: 'Impact',
  },
  lucidaSanUnicode: {
    id: 'course.assessment.submission.answer.scribing.lucidaSanUnicode',
    defaultMessage: 'Lucida Sans Unicode',
  },
  palatinoLinotype: {
    id: 'course.assessment.submission.answer.scribing.palatinoLinotype',
    defaultMessage: 'Palatino Linotype',
  },
  tahoma: {
    id: 'course.assessment.submission.answer.scribing.tahoma',
    defaultMessage: 'Tahoma',
  },
  timesNewRoman: {
    id: 'course.assessment.submission.answer.scribing.timesNewRoman',
    defaultMessage: 'Times New Roman',
  },
  fontSize: {
    id: 'course.assessment.submission.answer.scribing.fontSize',
    defaultMessage: 'Font Size:',
  },
  style: {
    id: 'course.assessment.submission.answer.scribing.style',
    defaultMessage: 'Style:',
  },
  solid: {
    id: 'course.assessment.submission.answer.scribing.solid',
    defaultMessage: 'Solid',
  },
  dotted: {
    id: 'course.assessment.submission.answer.scribing.dotted',
    defaultMessage: 'Dotted',
  },
  dashed: {
    id: 'course.assessment.submission.answer.scribing.dashed',
    defaultMessage: 'Dashed',
  },
  thickness: {
    id: 'course.assessment.submission.answer.scribing.thickness',
    defaultMessage: 'Thickness:',
  },
  rectangle: {
    id: 'course.assessment.submission.answer.scribing.rectangle',
    defaultMessage: 'Rectangle',
  },
  ellipse: {
    id: 'course.assessment.submission.answer.scribing.ellipse',
    defaultMessage: 'Ellipse',
  },
  text: {
    id: 'course.assessment.submission.answer.scribing.text',
    defaultMessage: 'Text',
  },
  pencil: {
    id: 'course.assessment.submission.answer.scribing.pencil',
    defaultMessage: 'Pencil',
  },
  line: {
    id: 'course.assessment.submission.answer.scribing.line',
    defaultMessage: 'Line',
  },
  shape: {
    id: 'course.assessment.submission.answer.scribing.shape',
    defaultMessage: 'Shape',
  },
  border: {
    id: 'course.assessment.submission.answer.scribing.border',
    defaultMessage: 'Border',
  },
  fill: {
    id: 'course.assessment.submission.answer.scribing.fill',
    defaultMessage: 'Fill',
  },
  noFill: {
    id: 'course.assessment.submission.answer.scribing.noFill',
    defaultMessage: 'No Fill',
  },
  select: {
    id: 'course.assessment.submission.answer.scribing.select',
    defaultMessage: 'Select',
  },
  layersLabelText: {
    id: 'course.assessment.submission.answer.scribing.layersLabelText',
    defaultMessage: 'Show work from:',
  },
  move: {
    id: 'course.assessment.submission.answer.scribing.move',
    defaultMessage: 'Move',
  },
  undo: {
    id: 'course.assessment.submission.answer.scribing.undo',
    defaultMessage: 'Undo',
  },
  redo: {
    id: 'course.assessment.submission.answer.scribing.redo',
    defaultMessage: 'Redo',
  },
  zoomIn: {
    id: 'course.assessment.submission.answer.scribing.zoomIn',
    defaultMessage: 'Zoom In',
  },
  zoomOut: {
    id: 'course.assessment.submission.answer.scribing.zoomOut',
    defaultMessage: 'Zoom Out',
  },
  delete: {
    id: 'course.assessment.submission.answer.scribing.delete',
    defaultMessage: 'Delete Object',
  },
  saving: {
    id: 'course.assessment.submission.answer.scribing.saving',
    defaultMessage: 'Saving..',
  },
  saved: {
    id: 'course.assessment.submission.answer.scribing.saved',
    defaultMessage: 'Saved',
  },
  saveError: {
    id: 'course.assessment.submission.answer.scribing.saveError',
    defaultMessage: 'Save error.',
  },
});

export default translations;
