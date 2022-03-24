import { defineMessages } from 'react-intl';

const translations = defineMessages({
  answerSubmitted: {
    id: 'course.assessment.submission.answerSubmitted',
    defaultMessage: 'Answer Submitted',
  },
  attempting: {
    id: 'course.assessment.submission.attempting',
    defaultMessage: 'Attempting',
  },
  attemptedAt: {
    id: 'course.assessment.submission.attemptedAt',
    defaultMessage: 'Attempted At',
  },
  autograde: {
    id: 'course.assessment.submission.autograde',
    defaultMessage: 'Evaluate Answers',
  },
  autogradeFailure: {
    id: 'course.assessment.submission.autogradeFailure',
    defaultMessage:
      '(T_T) Sorry, the autograder is having mood swings and quit on us. \
                    Try submitting your code again in a couple of minutes.',
  },
  autogradeSubmissionFailure: {
    id: 'course.assessment.submission.autogradeSubmissionFailure',
    defaultMessage: 'An error occurred while evaluating the answers.',
  },
  autogradeSubmissionSuccess: {
    id: 'course.assessment.submission.autogradeSubmissionSuccess',
    defaultMessage: 'All answers have been evaluated.',
  },
  bonusEndAt: {
    id: 'course.assessment.submission.bonusEndAt',
    defaultMessage: 'Bonus End At',
  },
  comments: {
    id: 'course.assessment.submission.comments',
    defaultMessage: 'Comments',
  },
  continue: {
    id: 'course.assessment.submission.continue',
    defaultMessage: 'Continue',
  },
  correct: {
    id: 'course.assessment.submission.correct',
    defaultMessage: 'Correct!',
  },
  deleteAllConfirmation: {
    id: 'course.assessment.submission.deleteAllConfirmation',
    defaultMessage:
      'Are you sure you want to DELETE the submissions for all {users}? \
                    All answers, past attempts, and submissions will be deleted \
                    and users will need to re-attempt all questions. NOTE THAT THIS ACTION IS IRREVERSIBLE',
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
  deleteFileFailure: {
    id: 'course.assessment.submission.deleteFileFailure',
    defaultMessage: 'File deletion failed: {errors}',
  },
  deleteFileSuccess: {
    id: 'course.assessment.submission.deleteFileSuccess',
    defaultMessage: 'File deleted successfully',
  },
  downloadRequestSuccess: {
    id: 'course.assessment.submission.downloadRequestSuccess',
    defaultMessage: 'Your download request is successful.',
  },
  deleteSubmissionSuccess: {
    id: 'course.assessment.submission.deleteSubmissionSuccess',
    defaultMessage: "{name}'s submission has been successfully deleted.",
  },
  downloadStatisticsJobPending: {
    id: 'course.assessment.submission.downloadStatisticsJobPending',
    defaultMessage:
      'Please wait as your request to download submission statistics is being processed.',
  },
  downloadSubmissionsJobPending: {
    id: 'course.assessment.submission.downloadSubmissionsJobPending',
    defaultMessage:
      'Please wait as your request to download submission answers is being processed.',
  },
  dueAt: {
    id: 'course.assessment.submission.dueAt',
    defaultMessage: 'Due At',
  },
  emptyAssessment: {
    id: 'course.assessment.submission.emptyAssessment',
    defaultMessage: 'This assessment currently has no questions.',
  },
  examDialogMessage: {
    id: 'course.assessment.submission.examDialogMessage',
    defaultMessage:
      'Please do not sign out or close the browser, otherwise \
                    you may have trouble continuing the exam.',
  },
  examDialogTitle: {
    id: 'course.assessment.submission.examDialogTitle',
    defaultMessage: 'You are entering an exam.',
  },
  expandComments: {
    id: 'course.assessment.submission.readOnlyEditor.expandComments',
    defaultMessage: 'Expand all comments',
  },
  expAwarded: {
    id: 'course.assessment.submission.expAwarded',
    defaultMessage: 'Experience Points Awarded',
  },
  finalise: {
    id: 'course.assessment.submission.finalise',
    defaultMessage: 'Finalise Submission',
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
  getPastAnswersFailure: {
    id: 'course.assessment.submission.getPastAnswersFailure',
    defaultMessage: 'Failed to load past answers',
  },
  group: {
    id: 'course.assessment.submission.group',
    defaultMessage: 'Group',
  },
  grade: {
    id: 'course.assessment.submission.grade',
    defaultMessage: 'Grade',
  },
  graded: {
    id: 'course.assessment.submission.graded',
    defaultMessage: 'Graded but not published',
  },
  grader: {
    id: 'course.assessment.submission.grader',
    defaultMessage: 'Grader',
  },
  gradedAt: {
    id: 'course.assessment.submission.gradedAt',
    defaultMessage: 'Graded At',
  },
  gradeSummary: {
    id: 'course.assessment.submission.gradeSummary',
    defaultMessage: 'Grade Summary',
  },
  importFilesSuccess: {
    id: 'course.assessment.submission.importFilesSuccess',
    defaultMessage: 'Files uploaded successfully.',
  },
  importFilesFailure: {
    id: 'course.assessment.submission.importFilesFailure',
    defaultMessage: 'File uploads failed: {errors}',
  },
  information: {
    id: 'course.assessment.submission.information',
    defaultMessage: 'Word from Text Passage',
  },
  invalidJavaFileUpload: {
    id: 'course.assessment.submission.invalidFileUpload',
    defaultMessage: 'File uploads failed: Only java files can be uploaded',
  },
  lateSubmission: {
    id: 'course.assessment.submission.lateSubmission',
    defaultMessage:
      'This submission is LATE! You may want to penalize the student for late submission.',
  },
  loadingComment: {
    id: 'course.assessment.submission.loadingComment',
    defaultMessage: 'Loading comment field...',
  },
  mark: {
    id: 'course.assessment.submission.mark',
    defaultMessage: 'Submit for Publishing',
  },
  maximumGroupGrade: {
    id: 'course.assessment.submission.maximumGroupGrade',
    defaultMessage: 'Maximum Grade for this Group',
  },
  multiplier: {
    id: 'course.assessment.submission.multiplier',
    defaultMessage: 'Multiplier',
  },
  noAnswerSelected: {
    id: 'course.assessment.submission.noAnswerSelected',
    defaultMessage: 'You have not selected any past answers.',
  },
  ok: {
    id: 'course.assessment.submission.ok',
    defaultMessage: 'OK',
  },
  pastAnswers: {
    id: 'course.assessment.submission.pastAnswers',
    defaultMessage: 'Past Answers',
  },
  point: {
    id: 'course.assessment.submission.point',
    defaultMessage: 'Point',
  },
  pointGrade: {
    id: 'course.assessment.submission.pointGrade',
    defaultMessage: 'Grade for this Point',
  },
  privateTestCaseFailure: {
    id: 'course.assessment.submission.privateTestCaseFailure',
    defaultMessage: 'Your code fails one or more private test cases.',
  },
  publicTestCaseFailure: {
    id: 'course.assessment.submission.publicTestCaseFailure',
    defaultMessage: 'Your code fails one or more public test cases.',
  },
  publish: {
    id: 'course.assessment.submission.publish',
    defaultMessage: 'Publish Grade',
  },
  published: {
    id: 'course.assessment.submission.published',
    defaultMessage: 'Graded',
  },
  publishConfirmation: {
    id: 'course.assessment.submission.publishConfirmation',
    defaultMessage:
      'Are you sure you want to publish all {graded} graded submissions ({selectedUsers})? \
                    THIS ACTION IS IRREVERSIBLE! \
                    All graded submissions will be published and users will be able to see their own grades.',
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
  submitConfirmation: {
    id: 'course.assessment.submission.submitConfirmation',
    defaultMessage:
      'THIS ACTION IS IRREVERSIBLE Are you sure you want to submit? \
                    You will no longer be able to amend your submission!',
  },
  question: {
    id: 'course.assessment.submission.question',
    defaultMessage: 'Question',
  },
  questionNumber: {
    id: 'course.assessment.submission.questionNumber',
    defaultMessage: 'Q{number}',
  },
  rendererNotImplemented: {
    id: 'course.assessment.submission.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
  reset: {
    id: 'course.assessment.submission.reset',
    defaultMessage: 'Reset Answer',
  },
  resetConfirmation: {
    id: 'course.assessment.submission.resetConfirmation',
    defaultMessage:
      'Are you sure you want to reset your answer? This action is irreversible \
                    and you will lose all your current work for this question.',
  },
  requestFailure: {
    id: 'course.assessment.submission.requestFailure',
    defaultMessage: 'An error occurred while processing your request.',
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
  saveDraft: {
    id: 'course.assessment.submission.saveDraft',
    defaultMessage: 'Save Draft',
  },
  saveGrade: {
    id: 'course.assessment.submission.saveGrade',
    defaultMessage: 'Save Grade',
  },
  sendReminderEmailConfirmation: {
    id: 'course.assessment.submission.sendReminderEmailConfirmation',
    defaultMessage:
      'Send reminder emails to {unattempted} unattempted \
      and {attempting} attempting user(s) ({selectedUsers}) \
      who have not completed the assessment?',
  },
  sendReminderEmailSuccess: {
    id: 'course.assessment.assessments.sendReminderEmailSuccess',
    defaultMessage:
      'Closing assessment reminder emails have been successfully dispatched.',
  },
  showCommentsPanel: {
    id: 'course.assessment.submission.readOnlyEditor.showCommentsPanel',
    defaultMessage: 'Show comments panel',
  },
  similarFileNameExists: {
    id: 'course.assessment.submission.similarFileNameExists',
    defaultMessage: 'File uploads failed: File already exists',
  },
  solution: {
    id: 'course.assessment.submission.solution',
    defaultMessage: 'Solution',
  },
  solutions: {
    id: 'course.assessment.submission.solutions',
    defaultMessage: 'Solutions',
  },
  solutionLemma: {
    id: 'course.assessment.submission.solutionLemma',
    defaultMessage: 'Solution (lemma form for autograding)',
  },
  solutionsWithMaximumGrade: {
    id: 'course.assessment.submission.solutionsWithMaximumGrade',
    defaultMessage:
      'Solutions (Maximum Grade for this Question: {maximumGrade})',
  },
  statistics: {
    id: 'course.assessment.submission.statistics',
    defaultMessage: 'Statistics',
  },
  status: {
    id: 'course.assessment.submission.status',
    defaultMessage: 'Submission Status',
  },
  student: {
    id: 'course.assessment.submission.student',
    defaultMessage: 'Name',
  },
  studentView: {
    id: 'course.assessment.submission.studentView',
    defaultMessage: 'Student View',
  },
  submit: {
    id: 'course.asssessment.submission.submit',
    defaultMessage: 'Submit',
  },
  submitted: {
    id: 'course.assessment.submission.submitted',
    defaultMessage: 'Submitted',
  },
  submittedAt: {
    id: 'course.assessment.submission.submittedAt',
    defaultMessage: 'Submitted At',
  },
  submitNoQuestionExplain: {
    id: 'course.asssessment.submission.submitNoQuestionExplain',
    defaultMessage: 'Mark as completed?',
  },
  submitError: {
    id: 'course.assessment.submission.submitError',
    defaultMessage:
      'Failure to submit answer. Please check the errors for your answers',
  },
  submitTooltip: {
    id: 'course.assessment.submission.submitShortcut',
    defaultMessage: '(Ctrl+Enter) or (⌘+Enter)',
  },
  submissionBy: {
    id: 'course.assessment.submission.submissionBy',
    defaultMessage: 'Submission by {submitter}',
  },
  totalGrade: {
    id: 'course.assessment.submission.totalGrade',
    defaultMessage: 'Total Grade',
  },
  type: {
    id: 'course.assessment.submission.type',
    defaultMessage: 'Type',
  },
  unmark: {
    id: 'course.assessment.submission.unmark',
    defaultMessage: 'Revert to Submitted',
  },
  unpublishedGrades: {
    id: 'course.assessment.submission.unpublishedGrades',
    defaultMessage:
      'These grades will not be visible to the student until they are published. \
                    This can be done at the submissions page of this assessment.',
  },
  unstarted: {
    id: 'course.assessment.submission.unstarted',
    defaultMessage: 'Not Started',
  },
  unsubmit: {
    id: 'course.assessment.submission.unsubmit',
    defaultMessage: 'Unsubmit Submission',
  },
  unsubmitAllConfirmation: {
    id: 'course.assessment.submission.unsubmitAllConfirmation',
    defaultMessage:
      'Are you sure you want to UNSUBMIT the submissions for all {users}? \
                    All submissions will be unsubmitted and this will reset the submission time \
                    and permit the users to change their submissions. NOTE THAT THIS ACTION IS IRREVERSIBLE',
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
  unsubmitConfirmation: {
    id: 'course.assessment.submission.unsubmitConfirmation',
    defaultMessage:
      'This will reset the submission time and permit the student to change \
                    their submission. NOTE THAT YOU CANNOT UNDO THIS!! Are you sure you want to proceed?',
  },
  unsubmitSubmissionSuccess: {
    id: 'course.assessment.submission.unsubmitSubmissionSuccess',
    defaultMessage: "{name}'s submission has been successfully unsubmitted.",
  },
  updateSuccess: {
    id: 'course.assessment.submission.updateSuccess',
    defaultMessage: 'Submission updated successfully.',
  },
  updateFailure: {
    id: 'course.assessment.submission.updateFailure',
    defaultMessage: 'Submission update failed: {errors}',
  },
  uploadFiles: {
    id: 'course.assessment.submission.uploadFiles',
    defaultMessage: 'Upload Files',
  },
  wrong: {
    id: 'course.assessment.submission.wrong',
    defaultMessage: 'Wrong!',
  },
});

export const scribingTranslations = defineMessages({
  arial: {
    id: 'course.assessment.submission.answer.scribing.arial',
    defaultMessage: 'Arial',
  },
  arialBlack: {
    id: 'course.assessment.submission.answer.scribing.arialBlack',
    defaultMessage: 'Arial Black',
  },
  border: {
    id: 'course.assessment.submission.answer.scribing.border',
    defaultMessage: 'Border',
  },
  colour: {
    id: 'course.assessment.submission.answer.scribing.colour',
    defaultMessage: 'Colour:',
  },
  comicSansMs: {
    id: 'course.assessment.submission.answer.scribing.comicSansMs',
    defaultMessage: 'Comic Sans MS',
  },
  dashed: {
    id: 'course.assessment.submission.answer.scribing.dashed',
    defaultMessage: 'Dashed',
  },
  delete: {
    id: 'course.assessment.submission.answer.scribing.delete',
    defaultMessage: 'Delete Object',
  },
  dotted: {
    id: 'course.assessment.submission.answer.scribing.dotted',
    defaultMessage: 'Dotted',
  },
  ellipse: {
    id: 'course.assessment.submission.answer.scribing.ellipse',
    defaultMessage: 'Ellipse',
  },
  fill: {
    id: 'course.assessment.submission.answer.scribing.fill',
    defaultMessage: 'Fill',
  },
  fontFamily: {
    id: 'course.assessment.submission.answer.scribing.fontFamily',
    defaultMessage: 'Font Family:',
  },
  fontSize: {
    id: 'course.assessment.submission.answer.scribing.fontSize',
    defaultMessage: 'Font Size:',
  },
  georgia: {
    id: 'course.assessment.submission.answer.scribing.georgia',
    defaultMessage: 'Georgia',
  },
  impact: {
    id: 'course.assessment.submission.answer.scribing.impact',
    defaultMessage: 'Impact',
  },
  layersLabelText: {
    id: 'course.assessment.submission.answer.scribing.layersLabelText',
    defaultMessage: 'Show work from:',
  },
  line: {
    id: 'course.assessment.submission.answer.scribing.line',
    defaultMessage: 'Line',
  },
  lucidaSanUnicode: {
    id: 'course.assessment.submission.answer.scribing.lucidaSanUnicode',
    defaultMessage: 'Lucida Sans Unicode',
  },
  move: {
    id: 'course.assessment.submission.answer.scribing.move',
    defaultMessage: 'Move',
  },
  noFill: {
    id: 'course.assessment.submission.answer.scribing.noFill',
    defaultMessage: 'No Fill',
  },
  palatinoLinotype: {
    id: 'course.assessment.submission.answer.scribing.palatinoLinotype',
    defaultMessage: 'Palatino Linotype',
  },
  pencil: {
    id: 'course.assessment.submission.answer.scribing.pencil',
    defaultMessage: 'Pencil',
  },
  rectangle: {
    id: 'course.assessment.submission.answer.scribing.rectangle',
    defaultMessage: 'Rectangle',
  },
  redo: {
    id: 'course.assessment.submission.answer.scribing.redo',
    defaultMessage: 'Redo',
  },
  saved: {
    id: 'course.assessment.submission.answer.scribing.saved',
    defaultMessage: 'Saved',
  },
  saving: {
    id: 'course.assessment.submission.answer.scribing.saving',
    defaultMessage: 'Saving..',
  },
  saveError: {
    id: 'course.assessment.submission.answer.scribing.saveError',
    defaultMessage: 'Save error.',
  },
  select: {
    id: 'course.assessment.submission.answer.scribing.select',
    defaultMessage: 'Select',
  },
  shape: {
    id: 'course.assessment.submission.answer.scribing.shape',
    defaultMessage: 'Shape',
  },
  solid: {
    id: 'course.assessment.submission.answer.scribing.solid',
    defaultMessage: 'Solid',
  },
  style: {
    id: 'course.assessment.submission.answer.scribing.style',
    defaultMessage: 'Style:',
  },
  tahoma: {
    id: 'course.assessment.submission.answer.scribing.tahoma',
    defaultMessage: 'Tahoma',
  },
  text: {
    id: 'course.assessment.submission.answer.scribing.text',
    defaultMessage: 'Text',
  },
  thickness: {
    id: 'course.assessment.submission.answer.scribing.thickness',
    defaultMessage: 'Thickness:',
  },
  timesNewRoman: {
    id: 'course.assessment.submission.answer.scribing.timesNewRoman',
    defaultMessage: 'Times New Roman',
  },
  undo: {
    id: 'course.assessment.submission.answer.scribing.undo',
    defaultMessage: 'Undo',
  },
  zoomIn: {
    id: 'course.assessment.submission.answer.scribing.zoomIn',
    defaultMessage: 'Zoom In',
  },
  zoomOut: {
    id: 'course.assessment.submission.answer.scribing.zoomOut',
    defaultMessage: 'Zoom Out',
  },
});

export default translations;
