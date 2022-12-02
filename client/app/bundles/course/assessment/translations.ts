import { defineMessages } from 'react-intl';

const translations = defineMessages({
  updateAssessment: {
    id: 'course.assessment.edit.update',
    defaultMessage: 'Save',
  },
  updateSuccess: {
    id: 'course.assessment.update.success',
    defaultMessage: 'Assessment was updated.',
  },
  updateFailure: {
    id: 'course.assessment.update.fail',
    defaultMessage: 'Failed to update assessment.',
  },
  newAssessment: {
    id: 'course.assessment.newAssessment',
    defaultMessage: 'New Assessment',
  },
  creationSuccess: {
    id: 'course.assessment.create.success',
    defaultMessage: 'Assessment was created.',
  },
  creationFailure: {
    id: 'course.assessment.create.fail',
    defaultMessage: 'Failed to create assessment.',
  },
  createAsDraft: {
    id: 'course.assessment.create.createAsDraft',
    defaultMessage: 'Create As Draft',
  },
  openingSoon: {
    id: 'course.assessments.index.openingSoon',
    defaultMessage: 'This assessment will be unlocked at a later time.',
  },
  unlockableHint: {
    id: 'course.assessments.index.unlockableHint',
    defaultMessage: 'Unlock this assessment by completing its requirements.',
  },
  title: {
    id: 'course.assessments.index.title',
    defaultMessage: 'Title',
  },
  autograded: {
    id: 'course.assessments.index.autograded',
    defaultMessage: 'Autograded',
  },
  passwordProtected: {
    id: 'course.assessments.index.passwordProtected',
    defaultMessage: 'Password-protected',
  },
  hasPersonalTimes: {
    id: 'course.assessments.index.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  hasPersonalTimesHint: {
    id: 'course.assessments.index.hasPersonalTimesHint',
    defaultMessage:
      "Timings for this assessment will automatically be adjusted based on students' learning rate.",
  },
  affectsPersonalTimes: {
    id: 'course.assessments.index.affectsPersonalTimes',
    defaultMessage: 'Affects personal times',
  },
  affectsPersonalTimesHint: {
    id: 'course.assessments.index.affectsPersonalTimesHint',
    defaultMessage:
      'Completion of this assessment may affect the timings for subsequent assessments.',
  },
  exp: {
    id: 'course.assessments.index.exp',
    defaultMessage: 'EXP',
  },
  bonusExp: {
    id: 'course.assessments.index.bonusExp',
    defaultMessage: 'Bonus',
  },
  neededFor: {
    id: 'course.assessments.index.neededFor',
    defaultMessage: 'Needed for',
  },
  startsAt: {
    id: 'course.assessments.index.startsAt',
    defaultMessage: 'Starts at',
  },
  endsAt: {
    id: 'course.assessments.index.endsAt',
    defaultMessage: 'Ends at',
  },
  bonusEndsAt: {
    id: 'course.assessments.index.bonusEndsAt',
    defaultMessage: 'Bonus ends at',
  },
  attempt: {
    id: 'course.assessments.index.attempt',
    defaultMessage: 'Attempt',
  },
  resume: {
    id: 'course.assessments.index.resume',
    defaultMessage: 'Resume',
  },
  unlock: {
    id: 'course.assessments.index.unlock',
    defaultMessage: 'Unlock',
  },
  view: {
    id: 'course.assessments.index.view',
    defaultMessage: 'View',
  },
  editAssessment: {
    id: 'course.assessments.index.editAssessment',
    defaultMessage: 'Edit Assessment',
  },
  submissions: {
    id: 'course.assessments.index.submissions',
    defaultMessage: 'Submissions',
  },
  needsPasswordToAccess: {
    id: 'course.assessments.index.needsPasswordToAccess',
    defaultMessage: 'You will need a password to access this assessment.',
  },
  draft: {
    id: 'course.assessments.index.draft',
    defaultMessage: 'Draft',
  },
  draftHint: {
    id: 'course.assessments.index.draftHint',
    defaultMessage: 'Only you and staff can see this assessment.',
  },
  seeAllRequirements: {
    id: 'course.assessments.index.seeAllRequirements',
    defaultMessage: 'See all requirements',
  },
  requirements: {
    id: 'course.assessment.show.requirements',
    defaultMessage: 'Requirements',
  },
  requirementsHint: {
    id: 'course.assessment.show.requirementsHint',
    defaultMessage:
      'The following items must be fulfilled to unlock this assessment.',
  },
  finishToUnlock: {
    id: 'course.assessment.show.finishToUnlock',
    defaultMessage: 'Finish to unlock',
  },
  finishToUnlockHint: {
    id: 'course.assessment.show.finishToUnlockHint',
    defaultMessage:
      'Completing this assessment will unlock the following items.',
  },
  questions: {
    id: 'course.assessment.show.questions',
    defaultMessage: 'Questions',
  },
  questionsReorderHint: {
    id: 'course.assessment.show.questionsReorderHint',
    defaultMessage: 'Drag and drop the questions to rearrange them.',
  },
  questionsEmptyHint: {
    id: 'course.assessment.show.questionsEmptyHint',
    defaultMessage: 'Add a new question to get started.',
  },
  files: {
    id: 'course.assessment.show.files',
    defaultMessage: 'Files',
  },
  downloadingFilesAttempts: {
    id: 'course.assessment.show.downloadingFilesAttempts',
    defaultMessage: 'Downloading any of these files will start an attempt.',
  },
  materialsDisabledHint: {
    id: 'course.assessment.show.materialsDisabledHint',
    defaultMessage:
      'Students cannot see these files, and you cannot download them, because the Materials component is disabled in Course Settings.',
  },
  manageComponents: {
    id: 'course.assessment.show.manageComponents',
    defaultMessage: 'Manage Components in Course Settings',
  },
  deleteAssessment: {
    id: 'course.assessment.show.deleteAssessment',
    defaultMessage: 'Delete Assessment',
  },
  gradingMode: {
    id: 'course.assessment.show.gradingMode',
    defaultMessage: 'Grading mode',
  },
  baseExp: {
    id: 'course.assessment.show.baseExp',
    defaultMessage: 'Base EXP',
  },
  showMcqMrqSolution: {
    id: 'course.assessment.show.showMcqMrqSolution',
    defaultMessage: 'Show MCQ/MRQ solutions',
  },
  gradedTestCases: {
    id: 'course.assessment.show.gradedTestCases',
    defaultMessage: 'Graded test cases',
  },
  allowSkipSteps: {
    id: 'course.assessment.show.allowSkipSteps',
    defaultMessage: 'Allow to skip steps',
  },
  allowSubmissionWithIncorrectAnswers: {
    id: 'course.assessment.show.allowSubmissionWithIncorrectAnswers',
    defaultMessage: 'Allow submission with incorrect answers',
  },
  showMcqSubmitResult: {
    id: 'course.assessment.show.showMcqSubmitResult',
    defaultMessage: 'Show MCQ submit result',
  },
  unsubmittingAndChangingQuestionType: {
    id: 'course.assessment.show.unsubmittingAndChangingQuestionType',
    defaultMessage:
      'Unsubmitting submissions and changing your question type...',
  },
  changingQuestionType: {
    id: 'course.assessment.show.changingQuestionType',
    defaultMessage: 'Changing your question type...',
  },
  questionTypeChangedUnsubmitted: {
    id: 'course.assessment.show.questionTypeChangedUnsubmitted',
    defaultMessage:
      'Question type successfully changed. All submissions are now unsubmitted.',
  },
  questionTypeChanged: {
    id: 'course.assessment.show.questionTypeChanged',
    defaultMessage: 'Question type successfully changed.',
  },
  errorChangingQuestionType: {
    id: 'course.assessment.show.errorChangingQuestionType',
    defaultMessage: 'An error occurred when changing your question type.',
  },
  unsubmitAndChange: {
    id: 'course.assessment.show.unsubmitAndChange',
    defaultMessage: 'Unsubmit and change',
  },
  changeAnyway: {
    id: 'course.assessment.show.changeAnyway',
    defaultMessage: 'Change anyway',
  },
  headsUpExistingSubmissions: {
    id: 'course.assessment.show.headsUpExistingSubmissions',
    defaultMessage: 'Heads up—there are existing submissions!',
  },
  changeToMrq: {
    id: 'course.assessment.show.changeToMrq',
    defaultMessage: 'Change to MRQ',
  },
  changeToMcq: {
    id: 'course.assessment.show.changeToMcq',
    defaultMessage: 'Change to MCQ',
  },
  sureChangingQuestionType: {
    id: 'course.assessment.show.sureChangingQuestionType',
    defaultMessage: "Sure you're changing this question type?",
  },
  changingThisToMrq: {
    id: 'course.assessment.show.changingThisToMrq',
    defaultMessage:
      'You are about to change the following question to a Multiple Response Question (MRQ):',
  },
  changingThisToMcq: {
    id: 'course.assessment.show.changingThisToMcq',
    defaultMessage:
      'You are about to change the following question to a Multiple Choice Question (MCQ):',
  },
  mrq: {
    id: 'course.assessment.show.mrq',
    defaultMessage: 'Multiple Response',
  },
  mcq: {
    id: 'course.assessment.show.mcq',
    defaultMessage: 'Multiple Choice',
  },
  thereAreExistingSubmissions: {
    id: 'course.assessment.show.thereAreExistingSubmissions',
    defaultMessage: 'There are existing submissions for this assessment.',
  },
  changingQuestionTypeWarning: {
    id: 'course.assessment.show.changingQuestionTypeWarning',
    defaultMessage:
      'Changing this question type might cause inconsistencies in the existing responses in these submissions.',
  },
  changingQuestionTypeAlert: {
    id: 'course.assessment.show.changingQuestionTypeAlert',
    defaultMessage:
      'You may wish to unsubmit all existing submissions before changing this question type. Students can then resubmit their submissions with the latest changes.',
  },
  sureDeletingAssessment: {
    id: 'course.assessment.show.sureDeletingAssessment',
    defaultMessage: "Sure you're deleting this assessment?",
  },
  deletingThisAssessment: {
    id: 'course.assessment.show.deletingThisAssessment',
    defaultMessage: 'You are about to delete the following assessment:',
  },
  deleteAssessmentWarning: {
    id: 'course.assessment.show.deleteAssessmentWarning',
    defaultMessage:
      'All existing submissions for this assessment will also be deleted. This action cannot be undone!',
  },
  deletingAssessment: {
    id: 'course.assessment.show.deletingAssessment',
    defaultMessage: 'No going back now. Deleting your assessment...',
  },
  assessmentDeleted: {
    id: 'course.assessment.show assessmentDeleted',
    defaultMessage: 'Assessment successfully deleted.',
  },
  errorDeletingAssessment: {
    id: 'course.assessment.show.errorDeletingAssessment',
    defaultMessage: 'An error occurred when deleting your assessment.',
  },
  deletingQuestion: {
    id: 'course.assessment.show.deletingQuestion',
    defaultMessage: 'This might take a while. Deleting your question...',
  },
  questionDeleted: {
    id: 'course.assessment.show.questionDeleted',
    defaultMessage: 'Question successfully deleted.',
  },
  errorDeletingQuestion: {
    id: 'course.assessment.show.errorDeletingQuestion',
    defaultMessage: 'An error occurred when deleting your question.',
  },
  deleteQuestion: {
    id: 'course.assessment.show.deleteQuestion',
    defaultMessage: 'Delete question',
  },
  sureDeletingQuestion: {
    id: 'course.assessment.show.sureDeletingQuestion',
    defaultMessage: "Sure you're deleting this question?",
  },
  deletingThisQuestion: {
    id: 'course.assessment.show.deletingThisQuestion',
    defaultMessage: 'You are about to delete the following question:',
  },
  deleteQuestionWarning: {
    id: 'course.assessment.show.deleteQuestionWarning',
    defaultMessage: 'This action cannot be undone!',
  },
  noItemsMatched: {
    id: 'course.assessment.show.noItemsMatched',
    defaultMessage: "Oops, no items matched ''{keyword}''.",
  },
  tryAgain: {
    id: 'course.assessment.show.tryAgain',
    defaultMessage: 'Try again?',
  },
  duplicatingQuestion: {
    id: 'course.assessment.show.duplicatingQuestion',
    defaultMessage: 'Duplicating your question...',
  },
  questionDuplicated: {
    id: 'course.assessment.show.questionDuplicated',
    defaultMessage: 'Your question has been duplicated.',
  },
  questionDuplicatedRefreshing: {
    id: 'course.assessment.show.questionDuplicated',
    defaultMessage:
      'Your question has been duplicated. We are refreshing to show you the latest changes.',
  },
  goToAssessment: {
    id: 'course.assessment.show.goToAssessment',
    defaultMessage: 'Go to the assessment',
  },
  errorDuplicatingQuestion: {
    id: 'course.assessment.show.errorDuplicatingQuestion',
    defaultMessage: 'An error occurred when duplicating your question.',
  },
  chooseAssessmentToDuplicateInto: {
    id: 'course.assessment.show.chooseAssessmentToDuplicateInto',
    defaultMessage: 'Choose an assessment to duplicate into',
  },
  duplicatingThisQuestion: {
    id: 'course.assessment.show.duplicatingThisQuestion',
    defaultMessage: 'You are about to duplicate the following question:',
  },
  searchTargetAssessment: {
    id: 'course.assessment.show.searchTargetAssessment',
    defaultMessage: 'Search target assessment',
  },
  hideOptions: {
    id: 'course.assessment.show.hideOptions',
    defaultMessage: 'Hide options',
  },
  showOptions: {
    id: 'course.assessment.show.showOptions',
    defaultMessage: 'Show options',
  },
  changeToMrqFull: {
    id: 'course.assessment.show.changeToMrqFull',
    defaultMessage: 'Change to Multiple Response (MRQ)',
  },
  changeToMcqFull: {
    id: 'course.assessment.show.changeToMcqFull',
    defaultMessage: 'Change to Multiple Choice (MCQ)',
  },
  multipleChoice: {
    id: 'course.assessment.show.multipleChoice',
    defaultMessage: 'Multiple Choice (MCQ)',
  },
  multipleResponse: {
    id: 'course.assessment.show.multipleResponse',
    defaultMessage: 'Multiple Response (MRQ)',
  },
  textResponse: {
    id: 'course.assessment.show.textResponse',
    defaultMessage: 'Text Response',
  },
  audioResponse: {
    id: 'course.assessment.show.audioResponse',
    defaultMessage: 'Audio Response',
  },
  fileUpload: {
    id: 'course.assessment.show.fileUpload',
    defaultMessage: 'File Upload',
  },
  programming: {
    id: 'course.assessment.show.programming',
    defaultMessage: 'Programming',
  },
  scribing: {
    id: 'course.assessment.show.scribing',
    defaultMessage: 'Scribing',
  },
  forumPostResponse: {
    id: 'course.assessment.show.forumPostResponse',
    defaultMessage: 'Forum Post Response',
  },
  newQuestion: {
    id: 'course.assessment.show.newQuestion',
    defaultMessage: 'New Question',
  },
  press: {
    id: 'course.assessment.show.press',
    defaultMessage: 'Press',
  },
  whileHoldingToCancelMoving: {
    id: 'course.assessment.show.whileHoldingToCancelMoving',
    defaultMessage: 'while holding to cancel moving.',
  },
  duplicateToAssessment: {
    id: 'course.assessment.show.duplicateToAssessment',
    defaultMessage: 'Duplicate to another assessment',
  },
  delete: {
    id: 'course.assessment.show.delete',
    defaultMessage: 'Delete',
  },
  edit: {
    id: 'course.assessment.show.edit',
    defaultMessage: 'Edit',
  },
  movingQuestions: {
    id: 'course.assessment.show.movingQuestions',
    defaultMessage: 'Updating your questions...',
  },
  questionMoved: {
    id: 'course.assessment.show.questionMoved',
    defaultMessage: 'Question was successfully moved.',
  },
  errorMovingQuestion: {
    id: 'course.assessment.show.errorMovingQuestion',
    defaultMessage: 'An error occurred while moving the question.',
  },
  assessmentOnlyAvailableFrom: {
    id: 'course.assessment.show.assessmentOnlyAvailableFrom',
    defaultMessage: 'This assessment will only be available from',
  },
  needToFulfilTheseRequirements: {
    id: 'course.assessment.show.needToFulfilTheseRequirements',
    defaultMessage:
      'You will need to fulfil the following requirement(s) before you can attempt this assessment:',
  },
  cannotAttemptBecauseNotAUser: {
    id: 'course.assessment.show.cannotAttemptBecauseNotAUser',
    defaultMessage:
      'You cannot attempt this assessment because you are not a user in this course.',
  },
  manuallyGraded: {
    id: 'course.assessment.show.manuallyGraded',
    defaultMessage: 'Manual',
  },
  hasUnautogradableQuestionsWarning1: {
    id: 'course.assessment.show.hasUnautogradableQuestionsWarning1',
    defaultMessage:
      'This assessment is autograded, but some of these questions are not autogradable. For these questions, the autograder will always award the maximum grade. Look out for the',
  },
  hasUnautogradableQuestionsWarning2: {
    id: 'course.assessment.show.hasUnautogradableQuestionsWarning2',
    defaultMessage: 'question(s) below.',
  },
  notAutogradable: {
    id: 'course.assessment.show.notAutogradable',
    defaultMessage: 'Not autogradable',
  },
});

export default translations;
