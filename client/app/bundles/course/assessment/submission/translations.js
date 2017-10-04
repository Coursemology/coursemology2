import { defineMessages } from 'react-intl';

const translations = defineMessages({
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
    defaultMessage: 'Save',
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
  runCode: {
    id: 'course.assessment.submission.runCode',
    defaultMessage: 'Run Code',
  },
  runCodeWithLimit: {
    id: 'course.assessment.submission.runCodeWithLimit',
    defaultMessage: 'Run Code ({attemptsLeft, plural, one {# attempt} other {# attempts}} left)',
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
    defaultMessage: 'THIS ACTION IS IRREVERSIBLE Are you sure you want to submit? \
                    You will no longer be able to amend your submission!',
  },
  unsubmitConfirmation: {
    id: 'course.assessment.submission.unsubmitConfirmation',
    defaultMessage: 'This will reset the submission time and permit the student to change \
                    his submission. NOTE THAT YOU CANNOT UNDO THIS!! Are you sure you want to proceed?',
  },
  resetConfirmation: {
    id: 'course.assessment.submission.resetConfirmation',
    defaultMessage: 'Are you sure you want to reset your answer? This action is irreversible \
                    and you will lose all your current work for this question.',
  },
  publishConfirmation: {
    id: 'course.assessment.submission.publishConfirmation',
    defaultMessage: 'THIS ACTION IS IRREVERSIBLE All graded submissions will be published and \
                     students will see their own grades. Are you sure you want to publish?',
  },
  lateSubmission: {
    id: 'course.assessment.submission.lateSubmission',
    defaultMessage: 'This submission is LATE! You may want to penalize the student for late submission.',
  },
  unpublishedGrades: {
    id: 'course.assessment.submission.unpublishedGrades',
    defaultMessage: 'These grades will not be visible to the student until they are published. \
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
  requestFailure: {
    id: 'course.assessment.submission.requestFailure',
    defaultMessage: 'An error occurred while processing your request.',
  },
  autogradeFailure: {
    id: 'course.assessment.submission.autogradeFailure',
    defaultMessage: '(T_T) Sorry, the autograder is having mood swings and quit on us. \
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
  publishSuccess: {
    id: 'course.assessment.submission.publishSuccess',
    defaultMessage: 'All graded submissions have been published.',
  },
  examDialogTitle: {
    id: 'course.assessment.submission.examDialogTitle',
    defaultMessage: 'You are entering an exam.',
  },
  examDialogMessage: {
    id: 'course.assessment.submission.examDialogMessage',
    defaultMessage: 'Please do not sign out or close the browser, otherwise \
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
});

export const scribingTranslations = defineMessages({
  colour: {
    id: 'course.assessment.submission.answer.scribing.colour',
    defaultMessage: 'Colour:',
  },
  colourOpacity: {
    id: 'course.assessment.submission.answer.scribing.colourOpacity',
    defaultMessage: 'Colour Opacity:',
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
  select: {
    id: 'course.assessment.submission.answer.scribing.select',
    defaultMessage: 'Select',
  },
  undo: {
    id: 'course.assessment.submission.answer.scribing.undo',
    defaultMessage: 'Undo',
  },
  redo: {
    id: 'course.assessment.submission.answer.scribing.redo',
    defaultMessage: 'Redo',
  },
  layersLabelText: {
    id: 'course.assessment.submission.answer.scribing.layersLabelText',
    defaultMessage: 'Show work from:',
  },
  move: {
    id: 'course.assessment.submission.answer.scribing.move',
    defaultMessage: 'Move',
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
