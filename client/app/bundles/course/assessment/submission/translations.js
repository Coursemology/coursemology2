import { defineMessages } from 'react-intl';

const translations = defineMessages({
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
    defaultMessage: 'Student',
  },
  status: {
    id: 'course.assessment.submission.status',
    defaultMessage: 'Status',
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
    defaultMessage: 'Submission update failed.',
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
});

export default translations;
