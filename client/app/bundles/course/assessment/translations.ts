import { defineMessages } from 'react-intl';

const translations = defineMessages({
  updateAssessment: {
    id: 'course.assessment.edit.update',
    defaultMessage: 'Save',
  },
  updateSuccess: {
    id: 'course.assessment.updateSuccess',
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
    id: 'course.assessment.creationSuccess',
    defaultMessage: 'Assessment was created.',
  },
  creationFailure: {
    id: 'course.assessment.creationFailure',
    defaultMessage: 'Failed to create assessment.',
  },
  createAsDraft: {
    id: 'course.assessment.create.createAsDraft',
    defaultMessage: 'Create As Draft',
  },
  createAssessmentToPopulate: {
    id: 'course.assessments.index.createAssessmentToPopulate',
    defaultMessage: 'Create an assessment to start populating {category}.',
  },
  noAssessments: {
    id: 'course.assessments.index.noAssessments',
    defaultMessage: "Whoops, there's nothing to see here, yet!",
  },
  openingSoon: {
    id: 'course.assessments.index.openingSoon',
    defaultMessage: 'This assessment will be unlocked at a later time.',
  },
  unlockableHint: {
    id: 'course.assessments.index.unlockableHint',
    defaultMessage: 'Unlock this assessment by fulfilling:',
  },
  title: {
    id: 'course.assessments.index.title',
    defaultMessage: 'Title',
  },
  autograded: {
    id: 'course.assessments.index.autograded',
    defaultMessage: 'Autograded',
  },
  timeLimitIcon: {
    id: 'course.assessments.index.timeLimitIcon',
    defaultMessage:
      'Time Limit: {timeLimit, plural, one {# minute} other {# minutes}}',
  },
  passwordProtected: {
    id: 'course.assessments.index.passwordProtected',
    defaultMessage: 'Password-protected',
  },
  exp: {
    id: 'course.assessments.index.exp',
    defaultMessage: 'EXP',
  },
  bonusExp: {
    id: 'course.assessments.index.bonusExp',
    defaultMessage: 'Bonus',
  },
  hasTodo: {
    id: 'course.assessments.index.hasTodo',
    defaultMessage: 'Has TODO',
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
  actions: {
    id: 'course.assessments.index.actions',
    defaultMessage: 'Actions',
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
  assessmentStatistics: {
    id: 'course.assessments.index.assessmentStatistics',
    defaultMessage: 'Assessment Statistics',
  },
  submissions: {
    id: 'course.assessments.index.submissions',
    defaultMessage: 'Submissions',
  },
  inviteToKoditsu: {
    id: 'course.assessments.index.inviteToKoditsu',
    defaultMessage: 'Invite users to Koditsu Exam',
  },
  invitingUserToKoditsu: {
    id: 'course.assessments.index.invitingUserToKoditsu',
    defaultMessage: 'Inviting users to Koditsu Exam',
  },
  invitingUserToKoditsuSuccess: {
    id: 'course.assessments.index.invitingUserToKoditsuSuccess',
    defaultMessage: 'Successful in inviting users to Koditsu Exam',
  },
  invitingUserToKoditsuFailure: {
    id: 'course.assessments.index.invitingUserToKoditsuFailure',
    defaultMessage:
      'There is a problem in inviting users to Koditsu. \
    Please try again later',
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
  syncingWithKoditsu: {
    id: 'course.assessment.show.syncingWithKoditsu',
    defaultMessage: 'Syncing with Koditsu',
  },
  syncedWithKoditsu: {
    id: 'course.assessment.show.syncedWithKoditsu',
    defaultMessage: 'Synced with Koditsu',
  },
  failedSyncingWithKoditsu: {
    id: 'course.assessment.show.failedSyncingWithKoditsu',
    defaultMessage: 'Not Synced with Koditsu',
  },
  koditsuMode: {
    id: 'course.assessment.show.koditsuMode',
    defaultMessage: 'Koditsu',
  },
  generate: {
    id: 'course.assessment.show.generate',
    defaultMessage: 'Generate Questions',
  },
  generateTooltip: {
    id: 'course.assessment.show.generateTooltip',
    defaultMessage: 'Collaborate with Codaveri AI to create questions',
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
  showRubricToStudents: {
    id: 'course.assessment.show.showRubricToStudents',
    defaultMessage: 'Show rubric breakdown to students',
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
    defaultMessage: 'Convert to MRQ',
  },
  changeToMcq: {
    id: 'course.assessment.show.changeToMcq',
    defaultMessage: 'Convert to MCQ',
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
    defaultMessage: 'Oops, no items matched "{keyword}".',
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
    defaultMessage:
      'Your question has been duplicated. <link>Go to the assessment</link>',
  },
  questionDuplicatedRefreshing: {
    id: 'course.assessment.show.questionDuplicatedRefreshing',
    defaultMessage:
      'Your question has been duplicated. We are refreshing to show you the latest changes.',
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
  voiceResponse: {
    id: 'course.assessment.show.voiceResponse',
    defaultMessage: 'Audio Response',
  },
  fileUpload: {
    id: 'course.assessment.show.fileUpload',
    defaultMessage: 'File Upload',
  },
  fileUploadDescription: {
    id: 'course.assessment.show.fileUploadDescription',
    defaultMessage:
      'Settings for the number of attachments allowed (none, one, or multiple)',
  },
  attachmentSettingsDescription: {
    id: 'course.assessment.question.textResponses.attachmentSettingsDescription',
    defaultMessage: 'When students are attempting this question,',
  },
  attachmentSettings: {
    id: 'course.assessment.question.textResponses.attachmentSettings',
    defaultMessage: 'Attachment Settings',
  },
  noAttachment: {
    id: 'course.assessment.question.textResponses.noAttachment',
    defaultMessage: 'No Attachment',
  },
  noAttachmentDescription: {
    id: 'course.assessment.question.textResponses.noAttachmentDescription',
    defaultMessage: 'They will not be able to upload any attachment.',
  },
  singleAttachment: {
    id: 'course.assessment.question.textResponses.singleFileAttachment',
    defaultMessage: 'Single Attachment',
  },
  singleFileAttachmentDescription: {
    id: 'course.assessment.question.textResponses.singleFileAttachmentDescription',
    defaultMessage: 'They can only upload one attachment.',
  },
  multipleAttachment: {
    id: 'course.assessment.question.textResponses.multipleAttachments',
    defaultMessage: 'Multiple Attachments',
  },
  multipleFileAttachmentDescription: {
    id: 'course.assessment.question.textResponses.multipleFileAttachmentDescription',
    defaultMessage: 'They can upload several attachments.',
  },
  isAttachmentRequired: {
    id: 'course.assessment.question.textResponses.isAttachmentRequired',
    defaultMessage: 'Require file upload for this question',
  },
  maxAttachments: {
    id: 'course.assessment.question.textResponses.maxAttachments',
    defaultMessage: 'Max Number of Attachments',
  },
  maxAttachmentSize: {
    id: 'course.assessment.question.textResponses.maxAttachmentSize',
    defaultMessage: 'Max Size per Attachment',
  },
  comprehension: {
    id: 'course.assessment.show.comprehension',
    defaultMessage: 'Comprehension',
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
  rubricBasedResponse: {
    id: 'course.assessment.show.rubricBasedResponse',
    defaultMessage: 'Rubric-Based Response',
  },
  newMultipleChoice: {
    id: 'course.assessment.show.newMultipleChoice',
    defaultMessage: 'New Multiple Choice Question (MCQ)',
  },
  newMultipleResponse: {
    id: 'course.assessment.show.newMultipleResponse',
    defaultMessage: 'New Multiple Response Question (MRQ)',
  },
  newTextResponse: {
    id: 'course.assessment.show.newTextResponse',
    defaultMessage: 'New Text Response Question',
  },
  newAudioResponse: {
    id: 'course.assessment.show.newAudioResponse',
    defaultMessage: 'New Audio Response Question',
  },
  newFileUpload: {
    id: 'course.assessment.show.newFileUpload',
    defaultMessage: 'New File Upload Question',
  },
  newRubricBasedResponse: {
    id: 'course.assessment.show.newRubricBasedResponse',
    defaultMessage: 'New Rubric Based Response Question',
  },
  newProgramming: {
    id: 'course.assessment.show.newProgramming',
    defaultMessage: 'New Programming Question',
  },
  newScribing: {
    id: 'course.assessment.show.newScribing',
    defaultMessage: 'New Scribing Question',
  },
  newForumPostResponse: {
    id: 'course.assessment.show.newForumPostResponse',
    defaultMessage: 'New Forum Post Response Question',
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
  generateFromQuestion: {
    id: 'course.assessment.show.generateFromQuestion',
    defaultMessage: 'Generate a similar question with AI',
  },
  generateFromProgrammingQuestion: {
    id: 'course.assessment.show.generateFromProgrammingQuestion',
    defaultMessage: 'Generate a similar question with Codaveri AI',
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
  plagiarismCheckable: {
    id: 'course.assessment.show.plagiarismCheckable',
    defaultMessage: 'Has plagiarism check',
  },
  noOptions: {
    id: 'course.assessment.show.noOptions',
    defaultMessage: 'This question has no options.',
  },
  description: {
    id: 'course.assessment.question.multipleResponses.description',
    defaultMessage: 'Description',
  },
  staffOnlyComments: {
    id: 'course.assessment.question.multipleResponses.staffOnlyComments',
    defaultMessage: 'Staff-only comments',
  },
  staffOnlyCommentsHint: {
    id: 'course.assessment.question.multipleResponses.staffOnlyCommentsHint',
    defaultMessage:
      'Useful for internal notes or documentations. Students will never see this.',
  },
  maximumGrade: {
    id: 'course.assessment.question.multipleResponses.maximumGrade',
    defaultMessage: 'Maximum grade',
  },
  alwaysGradeAsCorrect: {
    id: 'course.assessment.question.multipleResponses.alwaysGradeAsCorrect',
    defaultMessage: 'Always grade as correct',
  },
  alwaysGradeAsCorrectHint: {
    id: 'course.assessment.question.multipleResponses.alwaysGradeAsCorrectHint',
    defaultMessage:
      'If enabled, this question will always be graded as correct, regardless of the submitted responses. Makes sense if there are no "wrong" responses in this question.',
  },
  questionDetails: {
    id: 'course.assessment.question.multipleResponses.questionDetails',
    defaultMessage: 'Question details',
  },
  grading: {
    id: 'course.assessment.question.multipleResponses.grading',
    defaultMessage: 'Grading',
  },
  skills: {
    id: 'course.assessment.question.multipleResponses.skills',
    defaultMessage: 'Skills',
  },
  skillsHint: {
    id: 'course.assessment.question.multipleResponses.skillsHint',
    defaultMessage:
      "Completing this question will boost these stats in the students' skills.",
  },
  noSkillsCanCreateSkills: {
    id: 'course.assessment.question.multipleResponses.noSkillsCanCreateSkills',
    defaultMessage:
      'There are no skills in this course yet. You can create new skills at the <url>Skills</url> page.',
  },
  canConfigureSkills: {
    id: 'course.assessment.question.multipleResponses.canConfigureSkills',
    defaultMessage:
      'You can configure existing and create new skills at the <url>Skills</url> page.',
  },
  responses: {
    id: 'course.assessment.question.multipleResponses.responses',
    defaultMessage: 'Responses',
  },
  responsesHint: {
    id: 'course.assessment.question.multipleResponses.responsesHint',
    defaultMessage:
      'Explanations are displayed after a student submits their responses for this question.',
  },
  randomizeResponses: {
    id: 'course.assessment.question.multipleResponses.randomizeResponses',
    defaultMessage: 'Randomize responses',
  },
  randomizeResponsesHint: {
    id: 'course.assessment.question.multipleResponses.randomizeResponsesHint',
    defaultMessage:
      "If enabled, responses will always be randomized across attempts. Responses that ignore randomisation will always go to the end of the responses' list.",
  },
  response: {
    id: 'course.assessment.question.multipleResponses.response',
    defaultMessage: 'Response',
  },
  explanation: {
    id: 'course.assessment.question.multipleResponses.explanation',
    defaultMessage: 'Explanation',
  },
  explanationDescription: {
    id: 'course.assessment.question.multipleResponses.explanationDescription',
    defaultMessage:
      'The explanation to show after the student submits his answer.',
  },
  markAsCorrectResponse: {
    id: 'course.assessment.question.multipleResponses.markAsCorrectResponse',
    defaultMessage: 'Mark as a correct response',
  },
  deleteResponse: {
    id: 'course.assessment.question.multipleResponses.deleteResponse',
    defaultMessage: 'Delete response',
  },
  responseWillBeDeleted: {
    id: 'course.assessment.question.multipleResponses.responseWillBeDeleted',
    defaultMessage: 'This response will be deleted once you save your changes.',
  },
  newResponseCannotUndo: {
    id: 'course.assessment.question.multipleResponses.newResponseCannotUndo',
    defaultMessage:
      'This is a new response. It will immediately disappear if you delete before saving it.',
  },
  undoDeleteResponse: {
    id: 'course.assessment.question.multipleResponses.undoDeleteResponse',
    defaultMessage: 'Undo delete response',
  },
  addResponse: {
    id: 'course.assessment.question.multipleResponses.addResponse',
    defaultMessage: 'Add a new response',
  },
  ignoresRandomization: {
    id: 'course.assessment.question.multipleResponses.ignoresRandomization',
    defaultMessage: 'Ignores randomization',
  },
  choice: {
    id: 'course.assessment.question.multipleResponses.choice',
    defaultMessage: 'Choice',
  },
  choices: {
    id: 'course.assessment.question.multipleResponses.choices',
    defaultMessage: 'Choices',
  },
  choicesHint: {
    id: 'course.assessment.question.multipleResponses.choicesHint',
    defaultMessage:
      'Explanations are displayed after a student submits their choice for this question.',
  },
  markAsCorrectChoice: {
    id: 'course.assessment.question.multipleResponses.markAsCorrectChoice',
    defaultMessage: 'Mark as a correct choice',
  },
  deleteChoice: {
    id: 'course.assessment.question.multipleResponses.deleteChoice',
    defaultMessage: 'Delete choice',
  },
  choiceWillBeDeleted: {
    id: 'course.assessment.question.multipleResponses.choiceWillBeDeleted',
    defaultMessage: 'This choice will be deleted once you save your changes.',
  },
  newChoiceCannotUndo: {
    id: 'course.assessment.question.multipleResponses.newChoiceCannotUndo',
    defaultMessage:
      'This is a new choice. It will immediately disappear if you delete before saving it.',
  },
  undoDeleteChoice: {
    id: 'course.assessment.question.multipleResponses.undoDeleteChoice',
    defaultMessage: 'Undo delete choice',
  },
  addChoice: {
    id: 'course.assessment.question.multipleResponses.addChoice',
    defaultMessage: 'Add a new choice',
  },
  randomizeChoices: {
    id: 'course.assessment.question.multipleResponses.randomizeChoices',
    defaultMessage: 'Randomize choices',
  },
  randomizeChoicesHint: {
    id: 'course.assessment.question.multipleResponses.randomizeChoicesHint',
    defaultMessage:
      'If enabled, choices will always be randomized across attempts. Choices that ignore randomisation will always go to the end of the choices list.',
  },
  alwaysGradeAsCorrectChoiceHint: {
    id: 'course.assessment.question.multipleResponses.alwaysGradeAsCorrectChoiceHint',
    defaultMessage:
      'If enabled, this question will always be graded as correct, regardless of the submitted choice. Makes sense if there are no "wrong" choices in this question.',
  },
  convertToMcqHint: {
    id: 'course.assessment.question.multipleResponses.convertToMcqHint',
    defaultMessage:
      'If this question is converted to a Multiple Choice Question (MCQ), students can only submit one out of the many <s>responses</s> choices above. Note that you may define multiple correct choices.',
  },
  convertToMrqHint: {
    id: 'course.assessment.question.multipleResponses.convertToMrqHint',
    defaultMessage:
      'If this question is converted to a Multiple Response Question (MRQ), students can submit multiple <s>choices</s> responses defined above.',
  },
  mustSpecifyMaximumGrade: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyMaximumGrade',
    defaultMessage:
      'You must specify a valid, non-negative maximum grade to award.',
  },
  mustSpecifyMaxAttachment: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyMaxAttachment',
    defaultMessage:
      'You must specify a valid, positive maximum attachment number.',
  },
  mustSpecifyMaxAttachmentSize: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyMaxAttachmentSize',
    defaultMessage:
      'You must specify a valid, positive maximum attachment size.',
  },
  mustSpecifyPositiveMaximumGrade: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyPositiveMaximumGrade',
    defaultMessage: 'Maximum grade has to be non-negative.',
  },
  mustSpecifyPositiveMaxAttachment: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyPositiveMaxAttachment',
    defaultMessage: 'Max Number of Attachments has to be at least 2.',
  },
  mustSpecifyPositiveMaxAttachmentSize: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyPositiveMaxAttachmentSize',
    defaultMessage: 'Max Size has to be positive.',
  },
  mustBeLessThanMaxMaximumGrade: {
    id: 'course.assessment.question.multipleResponses.mustBeLessThanMaxMaximumGrade',
    defaultMessage: 'Must be less than 1000.',
  },
  mustBeLessThanMaxAttachments: {
    id: 'course.assessment.question.multipleResponses.mustBeLessThanMaxAttachments',
    defaultMessage: 'Must be at most {defaultMax}.',
  },
  mustBeLessThanMaxAttachmentSize: {
    id: 'course.assessment.question.multipleResponses.mustBeLessThanMaxAttachmentSize',
    defaultMessage: 'Must be at most {defaultMax}MB.',
  },
  mustSpecifyResponse: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyResponse',
    defaultMessage: 'You must specify a valid response title.',
  },
  mustSpecifyChoice: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyChoice',
    defaultMessage: 'You must specify a valid choice title.',
  },
  mustHaveAtLeastOneResponse: {
    id: 'course.assessment.question.multipleResponses.mustHaveAtLeastOneResponse',
    defaultMessage: 'You must specify at least one response.',
  },
  mustSpecifyAtLeastOneCorrectChoice: {
    id: 'course.assessment.question.multipleResponses.mustSpecifyAtLeastOneCorrectChoice',
    defaultMessage: 'You must specify at least one correct choice.',
  },
  questionCreated: {
    id: 'course.assessment.question.multipleResponses.questionCreated',
    defaultMessage: 'Question was successfully created.',
  },
  saveChangesFirstBeforeConvertingMcqMrq: {
    id: 'course.assessment.question.multipleResponses.saveChangesFirstBeforeConvertingMcqMrq',
    defaultMessage:
      'Please save your changes before attempting to convert this question.',
  },
  mustSpecifyMaximumPosts: {
    id: 'course.assessment.question.forumPostResponses.mustSpecifyMaximumPosts',
    defaultMessage:
      'You must specify a valid, positive maximum posts to be allowed.',
  },
  mustSpecifyPositiveMaximumPosts: {
    id: 'course.assessment.question.forumPostResponses.mustSpecifyPositiveMaximumPosts',
    defaultMessage: 'Maximum posts has to be positive.',
  },
  forumPosts: {
    id: 'course.assessment.question.forumPostResponses.forumPosts',
    defaultMessage: 'Additional Settings',
  },
  forumPostsRequirements: {
    id: 'course.assessment.question.forumPostResponses.forumPostsRequirements',
    defaultMessage:
      'Additional forum posts question settings for this question',
  },
  maxPosts: {
    id: 'course.assessment.question.forumPostResponses.maxPosts',
    defaultMessage: 'Maximum number of forum posts a student could select',
  },
  enableTextResponse: {
    id: 'course.assessment.question.forumPostResponses.enableTextResponse',
    defaultMessage:
      'Include a text field for students to provide further inputs',
  },
  solutions: {
    id: 'course.assessment.question.textResponses.solutions',
    defaultMessage: 'Solutions',
  },
  solutionsHint: {
    id: 'course.assessment.question.textResponses.solutionsHint',
    defaultMessage:
      'Adding solutions allows the answer to be autograded. Students can only input plain text.',
  },
  solutionWillBeDeleted: {
    id: 'course.assessment.question.textResponses.solutionWillBeDeleted',
    defaultMessage: 'This solution will be deleted once you save your changes.',
  },
  rubric: {
    id: 'course.assessment.question.rubricBasedResponses.rubric',
    defaultMessage: 'Rubric',
  },
  categoryName: {
    id: 'course.assessment.question.rubricBasedResponses.categoryName',
    defaultMessage: 'Category Name',
  },
  categoryMaximumGrade: {
    id: 'course.assessment.question.rubricBasedResponses.categoryMaximumGrade',
    defaultMessage: 'Max Grade',
  },
  categoryGrade: {
    id: 'course.assessment.question.rubricBasedResponses.categoryGrade',
    defaultMessage: 'Band Score',
  },
  gradeExplanation: {
    id: 'course.assessment.question.rubricBasedResponses.gradeExplanation',
    defaultMessage: 'Explanation',
  },
  rubricHint: {
    id: 'course.assessment.question.rubricBasedResponses.rubricHint',
    defaultMessage: "Rubric is used to grade the student's submission.",
  },
  bonusReservedNames: {
    id: 'course.assessment.question.rubricBasedResponses.bonusReservedNames',
    defaultMessage:
      "After finalization, a special category named 'Moderation' will be added automatically. \
      It allows graders to award bonus or penalty points at their discretion.",
  },
  addNewCategory: {
    id: 'course.assessment.question.rubricBasedResponses.addNewCategory',
    defaultMessage: 'Add new category',
  },
  addNewGrade: {
    id: 'course.assessment.question.rubricBasedResponses.addNewLevel',
    defaultMessage: 'Add new grade',
  },
  aiGrading: {
    id: 'course.assessment.question.rubricBasedResponses.aiGrading',
    defaultMessage: 'AI Grading',
  },
  enableAiGrading: {
    id: 'course.assessment.question.rubricBasedResponses.enableAiGrading',
    defaultMessage: 'Enable AI to auto-grade submissions',
  },
  enableAiGradingDescription: {
    id: 'course.assessment.question.rubricBasedResponses.enableAiGradingDescription',
    defaultMessage:
      'AI will assign rubric scores and draft feedback for you to review and publish.',
  },
  aiGradingCustomPrompt: {
    id: 'course.assessment.question.rubricBasedResponses.aiGradingCustomPrompt',
    defaultMessage: 'Custom Prompt',
  },
  aiGradingCustomPromptDescription: {
    id: 'course.assessment.question.rubricBasedResponses.aiGradingCustomPromptDescription',
    defaultMessage:
      'Add grading instructions (e.g. question context, model answer, feedback tone). Leave blank if unsure.',
  },
  newSolutionCannotUndo: {
    id: 'course.assessment.question.textResponses.newSolutionCannotUndo',
    defaultMessage:
      'This is a new solution. It will immediately disappear if you delete before saving it.',
  },
  undoDeleteSolution: {
    id: 'course.assessment.question.textResponses.undoDeleteSolution',
    defaultMessage: 'Undo delete solution',
  },
  addSolution: {
    id: 'course.assessment.question.textResponses.addSolution',
    defaultMessage: 'Add a new solution',
  },
  solution: {
    id: 'course.assessment.question.textResponses.solution',
    defaultMessage: 'Solution',
  },
  zeroGrade: {
    id: 'course.assessment.question.textResponses.zeroGrade',
    defaultMessage: '0.0',
  },
  solutionType: {
    id: 'course.assessment.question.textResponses.solutionType',
    defaultMessage: 'Type of Solution',
  },
  solutionTypeExplanation: {
    id: 'course.assessment.question.textResponses.solutionTypeExplanation',
    defaultMessage:
      'If Exact Match is selected, solutions with multiple lines must match student answers exactly for the answer to be graded as correct.',
  },
  exactMatch: {
    id: 'course.assessment.question.textResponses.exactMatch',
    defaultMessage: 'Exact Match',
  },
  keyword: {
    id: 'course.assessment.question.textResponses.keyword',
    defaultMessage: 'Keyword',
  },
  grade: {
    id: 'course.assessment.question.textResponses.grade',
    defaultMessage: 'Grade',
  },
  deleteSolution: {
    id: 'course.assessment.question.textResponses.deleteSolution',
    defaultMessage: 'Delete solution',
  },
  mustSpecifyGrade: {
    id: 'course.assessment.question.textResponses.mustSpecifyGrade',
    defaultMessage: 'You must specify a valid number for grade.',
  },
  mustSpecifySolution: {
    id: 'course.assessment.question.textResponses.mustSpecifySolution',
    defaultMessage: 'You must specify a valid solution title.',
  },
  textResponseNote: {
    id: 'course.assessment.question.textResponses.textResponseNote',
    defaultMessage:
      'Note: If no solutions are provided, the autograder will always award the maximum grade.',
  },
  fileUploadNote: {
    id: 'course.assessment.question.textResponses.fileUploadNote',
    defaultMessage:
      'Note: File upload question is not auto-gradable. The autograder will always award the maximum grade.',
  },
  mustSpecifySolutionType: {
    id: 'course.assessment.question.textResponses.mustSpecifySolutionType',
    defaultMessage:
      'You must choose either exact match or keyword as solution type.',
  },
  validAttachmentSettingValues: {
    id: 'course.assessment.question.textResponses.validAttachmentSettingValues',
    defaultMessage:
      'Attachment Settings should be either no attachment, single file attachment, or multiple file attachment',
  },
  attachmentSettingRequired: {
    id: 'course.assessment.question.textResponses.attachmentSettingRequired',
    defaultMessage: 'Attachment Setting should be defined in this question',
  },
  recentActivities: {
    id: 'course.assessment.monitoring.recentActivities',
    defaultMessage: 'Recent activities',
  },
  recentActivitiesHint: {
    id: 'course.assessment.monitoring.recentActivitiesHint',
    defaultMessage: 'These logs will disappear if you close this tab!',
  },
  connecting: {
    id: 'course.assessment.monitoring.connecting',
    defaultMessage: 'Connecting',
  },
  connected: {
    id: 'course.assessment.monitoring.connected',
    defaultMessage: 'Connected',
  },
  disconnected: {
    id: 'course.assessment.monitoring.disconnected',
    defaultMessage: 'Disconnected',
  },
  filterByGroup: {
    id: 'course.assessment.monitoring.filterByGroup',
    defaultMessage: 'Filter by Group',
  },
  pulsegrid: {
    id: 'course.assessment.monitoring.pulsegrid',
    defaultMessage: 'PulseGrid',
  },
  summaryCorrectAsAt: {
    id: 'course.assessment.monitoring.summaryCorrectAsAt',
    defaultMessage: 'Summary correct as at {time}',
  },
  generatedAt: {
    id: 'course.assessment.monitoring.generatedAt',
    defaultMessage: 'Generated at',
  },
  userAgent: {
    id: 'course.assessment.monitoring.userAgent',
    defaultMessage: 'User Agent',
  },
  sebPayload: {
    id: 'course.assessment.monitoring.sebPayload',
    defaultMessage: 'Safe Exam Browser (SEB) Config Key Hash & URL',
  },
  type: {
    id: 'course.assessment.monitoring.type',
    defaultMessage: 'Type',
  },
  stale: {
    id: 'course.assessment.monitoring.stale',
    defaultMessage: 'Stale',
  },
  staleHint: {
    id: 'course.assessment.monitoring.staleHint',
    defaultMessage:
      "This heartbeat wasn't immediately received by the server because the examinee's browser was temporarily " +
      'unreachable. It was cached in the browser, and sent to the server when the browser was reachable again.',
  },
  live: {
    id: 'course.assessment.monitoring.live',
    defaultMessage: 'Live',
  },
  liveHint: {
    id: 'course.assessment.monitoring.liveHint',
    defaultMessage: 'This heartbeat was immediately received by the server.',
  },
  ipAddress: {
    id: 'course.assessment.monitoring.ipAddress',
    defaultMessage: 'IP Address',
  },
  detailsOfNHeartbeats: {
    id: 'course.assessment.monitoring.detailsOfNHeartbeats',
    defaultMessage: 'Last {n} heartbeats',
  },
  deltaFromPreviousHeartbeat: {
    id: 'course.assessment.monitoring.deltaFromPreviousHeartbeat',
    defaultMessage: '{ms} ms from previous heartbeat',
  },
  firstReceivedHeartbeat: {
    id: 'course.assessment.monitoring.firstReceivedHeartbeat',
    defaultMessage: 'First received heartbeat',
  },
  liveness: {
    id: 'course.assessment.monitoring.liveness',
    defaultMessage: 'Liveness',
  },
  resetZoom: {
    id: 'course.assessment.monitoring.resetZoom',
    defaultMessage: 'Reset zoom',
  },
  zoomPanHint: {
    id: 'course.assessment.monitoring.zoomPanHint',
    defaultMessage: 'Pinch or scroll to zoom. Drag to pan.',
  },
  loadAllHeartbeats: {
    id: 'course.assessment.monitoring.loadAllHeartbeats',
    defaultMessage: 'Load all',
  },
  userHeartbeatNotReceivedInTime: {
    id: 'course.assessment.monitoring.userHeartbeatNotReceivedInTime',
    defaultMessage: "{name}'s heartbeat wasn't received in time.",
  },
  userHeartbeatContinuedStreaming: {
    id: 'course.assessment.monitoring.userHeartbeatContinuedStreaming',
    defaultMessage: "{name}'s heartbeat just continued streaming.",
  },
  blankField: {
    id: 'course.assessment.monitoring.blankField',
    defaultMessage: '(blank)',
  },
  cannotConnectToLiveMonitoringChannel: {
    id: 'course.assessment.monitoring.cannotConnectToLiveMonitoringChannel',
    defaultMessage:
      'Oops, an error occurred when connecting to the live monitoring channel.',
  },
  noActiveSessions: {
    id: 'course.assessment.monitoring.noActiveSessions',
    defaultMessage: 'No active sessions. No attempts have been made.',
  },
  expiredSession: {
    id: 'course.assessment.monitoring.expiredSession',
    defaultMessage:
      'Expired session. It has been at least 24 hours since the submission was made.',
  },
  stoppedSession: {
    id: 'course.assessment.monitoring.stoppedSession',
    defaultMessage:
      'Stopped session. Student may have finalised their submission.',
  },
  alivePresenceHint: {
    id: 'course.assessment.monitoring.alivePresenceHint',
    defaultMessage: 'Last heartbeat was received in time.',
  },
  alivePresenceHintSUSMatches: {
    id: 'course.assessment.monitoring.alivePresenceHintSUSMatches',
    defaultMessage:
      'Last heartbeat was received in time and came from an authorised browser, if browser authorisation is enabled.',
  },
  latePresenceHint: {
    id: 'course.assessment.monitoring.latePresenceHint',
    defaultMessage:
      "Next heartbeat hasn't been received in time, but still within the configured inter-heartbeats interval.",
  },
  missingPresenceHint: {
    id: 'course.assessment.monitoring.missingPresenceHint',
    defaultMessage:
      "Next heartbeat hasn't been received in time, or the last heartbeat came from an unauthorised browser, " +
      'if browser authorisation is enabled.',
  },
  validHeartbeat: {
    id: 'course.assessment.monitoring.validHeartbeat',
    defaultMessage: 'Valid',
  },
  invalidHeartbeat: {
    id: 'course.assessment.monitoring.invalidHeartbeat',
    defaultMessage: 'Invalid',
  },
  invalidBrowser: {
    id: 'course.assessment.monitoring.invalidBrowser',
    defaultMessage: 'Invalid browser configuration',
  },
  invalidBrowserSubtitle: {
    id: 'course.assessment.monitoring.invalidBrowserSubtitle',
    defaultMessage:
      'Access to this assessment is not allowed with your current browser and/or its configuration. ' +
      'Contact your instructor for assistance.',
  },
  sessionUnlockPassword: {
    id: 'course.assessment.monitoring.sessionUnlockPassword',
    defaultMessage: 'Session unlock password',
  },
  overrideAccess: {
    id: 'course.assessment.monitoring.overrideAccess',
    defaultMessage: 'Override access',
  },
  accessGrantedForThisSessionOnly: {
    id: 'course.assessment.monitoring.accessGrantedForThisSessionOnly',
    defaultMessage: 'Access will be granted only for this browser session.',
  },
  openSubmissionInNewTab: {
    id: 'course.assessment.monitoring.openSubmissionInNewTab',
    defaultMessage: 'Open submission in new tab',
  },
  attemptingAssessment: {
    id: 'course.assessment.submission.attemptingAssessment',
    defaultMessage: 'Creating a new submission...',
  },
  createSubmissionSuccessful: {
    id: 'course.assessment.submission.createSubmissionSuccessful',
    defaultMessage: 'Submission created! Redirecting now...',
  },
  createSubmissionFailed: {
    id: 'course.assessment.submission.createSubmissionFailed',
    defaultMessage: 'Submission attempt failed! {error}',
  },
  password: {
    id: 'course.assessment.session.password',
    defaultMessage: 'Password',
  },
  lockedSessionAssessment: {
    id: 'course.assessment.session.lockedSessionAssessment',
    defaultMessage:
      'The assessment is locked, please approach any course staff for assistance.',
  },
  lockedAssessment: {
    id: 'course.assessment.session.lockedAssessment',
    defaultMessage:
      'The assessment is locked, please input the password to continue.',
  },
  assessmentNotStarted: {
    id: 'course.assessment.session.assessmentNotStarted',
    defaultMessage:
      'The assessment has not started yet. Please come back after {startDate}.',
  },
  canEnableCodaveriInComponents: {
    id: 'course.assessment.question.programming.canEnableCodaveriInComponents',
    defaultMessage:
      'Contact the course manager or owner to enable this feature in Components in the Course Settings.',
  },
  buildLog: {
    id: 'course.assessment.question.programming.buildLog',
    defaultMessage: 'Package build log',
  },
  buildLogHint: {
    id: 'course.assessment.question.programming.buildLogHint',
    defaultMessage:
      'These will disappear once the evaluation package is successfully imported.',
  },
  standardError: {
    id: 'course.assessment.question.programming.standardError',
    defaultMessage: 'Standard error',
  },
  standardOutput: {
    id: 'course.assessment.question.programming.standardOutput',
    defaultMessage: 'Standard output',
  },
  prependHint: {
    id: 'course.assessment.question.programming.prependHint',
    defaultMessage:
      'Inserted before the submitted code. Useful for defining given helper functions, variables, or packages.',
  },
  prepend: {
    id: 'course.assessment.question.programming.prepend',
    defaultMessage: 'Prepend',
  },
  appendHint: {
    id: 'course.assessment.question.programming.appendHint',
    defaultMessage:
      'Inserted after the submitted code. Useful for defining complex test cases or overriding functions or variables in the submitted code.',
  },
  append: {
    id: 'course.assessment.question.programming.append',
    defaultMessage: 'Append',
  },
  templateHint: {
    id: 'course.assessment.question.programming.templateHint',
    defaultMessage: 'What appears in the editor when a new attempt is made.',
  },
  template: {
    id: 'course.assessment.question.programming.template',
    defaultMessage: 'Template',
  },
  solutionHint: {
    id: 'course.assessment.question.programming.solutionHint',
    defaultMessage: 'Always hidden. Stored here for reference only.',
  },
  templates: {
    id: 'course.assessment.question.programming.templates',
    defaultMessage: 'Templates',
  },
  codeInserts: {
    id: 'course.assessment.question.programming.codeInserts',
    defaultMessage: 'Code inserts',
  },
  codeInsertsHint: {
    id: 'course.assessment.question.programming.codeInsertsHint',
    defaultMessage:
      'These are inserted around submitted codes internally before evaluation. They are never exposed to anyone.',
  },
  dataFiles: {
    id: 'course.assessment.question.programming.dataFiles',
    defaultMessage: 'Data files',
  },
  testCases: {
    id: 'course.assessment.question.programming.testCases',
    defaultMessage: 'Test cases',
  },
  hideExplanation: {
    id: 'course.assessment.question.programming.hideExplanation',
    defaultMessage: 'Hide this explanation',
  },
  showTestCasesExplanation: {
    id: 'course.assessment.question.programming.showTestCasesExplanation',
    defaultMessage: 'How are these test cases run and compared?',
  },
  publicTestCases: {
    id: 'course.assessment.question.programming.publicTestCases',
    defaultMessage: 'Public test cases',
  },
  privateTestCases: {
    id: 'course.assessment.question.programming.privateTestCases',
    defaultMessage: 'Private test cases',
  },
  privateTestCasesHint: {
    id: 'course.assessment.question.programming.privateTestCasesHint',
    defaultMessage: 'Students cannot see these, but can know if any one fails.',
  },
  evaluationTestCases: {
    id: 'course.assessment.question.programming.evaluationTestCases',
    defaultMessage: 'Evaluation test cases',
  },
  evaluationTestCasesHint: {
    id: 'course.assessment.question.programming.evaluationTestCasesHint',
    defaultMessage:
      'Students cannot see these and will not know if any one fails.',
  },
  cppTestCasesHint: {
    id: 'course.assessment.question.programming.cppTestCasesHint',
    defaultMessage:
      'Expressions will be evaluated in the context of the submitted code. Their return values will then ' +
      'be compared against the Expected expectations using the <code>EXPECT_*</code> assertions from the ' +
      '<gtf>Google Test Framework</gtf>. Floating point numbers are formatted with <sts>std::to_string</sts>.',
  },
  addFiles: {
    id: 'course.assessment.question.programming.addFiles',
    defaultMessage: 'Add files',
  },
  oneDuplicateFileNotAdded: {
    id: 'course.assessment.question.programming.oneDuplicateFileNotAdded',
    defaultMessage:
      '{name} was not added because other files with the same name were selected or already added. ' +
      'Remove the existing file(s) or rename the new file to add it.',
  },
  someDuplicateFilesNotAdded: {
    id: 'course.assessment.question.programming.someDuplicateFilesNotAdded',
    defaultMessage:
      'These files were not added because other files with the same name were selected or already added.',
  },
  fileName: {
    id: 'course.assessment.question.programming.fileName',
    defaultMessage: 'File name',
  },
  fileSize: {
    id: 'course.assessment.question.programming.fileSize',
    defaultMessage: 'Size',
  },
  evaluator: {
    id: 'course.assessment.question.programming.evaluator',
    defaultMessage: 'Evaluator',
  },
  defaultEvaluator: {
    id: 'course.assessment.question.programming.defaultEvaluator',
    defaultMessage: 'Default',
  },
  defaultEvaluatorHint: {
    id: 'course.assessment.question.programming.defaultEvaluatorHint',
    defaultMessage:
      'No fuss; just run the code according to the evaluation package below and report the test results.',
  },
  evaluatorHasDependencies: {
    id: 'course.assessment.question.programming.evaluatorHasDependencies',
    defaultMessage:
      'This evaluator comes with <viewdeps>certain third-party dependencies installed.</viewdeps>',
  },
  defaultEvaluatorDependencyTitle: {
    id: 'course.assessment.question.programming.defaultEvaluatorDependencyTitle',
    defaultMessage: '{name}: Installed Dependencies',
  },
  defaultEvaluatorDependencyDescription: {
    id: 'course.assessment.question.programming.defaultEvaluatorDependencyDescription',
    defaultMessage:
      'Submitted code is run in a containerized environment with the following dependencies installed locally.{br}If your programming question requires a dependency not listed below, <mailto>contact us</mailto> and we will consider adding it.',
  },
  dependencySearchText: {
    id: 'course.assessment.question.programming.dependencySearchText',
    defaultMessage: 'Search dependencies by name',
  },
  dependencyVersionTableHeading: {
    id: 'course.assessment.question.programming.dependencyVersionTableHeading',
    defaultMessage: 'Version',
  },
  codaveriEvaluator: {
    id: 'course.assessment.question.programming.codaveriEvaluator',
    defaultMessage: 'Codaveri',
  },
  codaveriEvaluatorHint: {
    id: 'course.assessment.question.programming.codaveriEvaluatorHint',
    defaultMessage:
      'On top of the default evaluation, this evaluator will provide automated code feedback powered by Codaveri when the submission is finalised. They will appear as draft comments for the instructors to review, edit, and publish.',
  },
  evaluationLimits: {
    id: 'course.assessment.question.programming.evaluationLimits',
    defaultMessage: 'Evaluation limits',
  },
  memoryLimit: {
    id: 'course.assessment.question.programming.memoryLimit',
    defaultMessage: 'Memory limit',
  },
  timeLimit: {
    id: 'course.assessment.question.programming.timeLimit',
    defaultMessage: 'Time limit',
  },
  timeLimitDetail: {
    id: 'course.assessment.question.programming.timeLimitDetail',
    defaultMessage: '{timeLimit, plural, one {# minute} other {# minutes}}',
  },
  attemptLimit: {
    id: 'course.assessment.question.programming.attemptLimit',
    defaultMessage: 'Attempt limit',
  },
  seconds: {
    id: 'course.assessment.question.programming.seconds',
    defaultMessage: 's',
  },
  megabytes: {
    id: 'course.assessment.question.programming.megabytes',
    defaultMessage: 'MB',
  },
  lowestGradingPriority: {
    id: 'course.assessment.question.programming.lowestGradingPriority',
    defaultMessage: 'Lowest grading priority',
  },
  lowestGradingPriorityHint: {
    id: 'course.assessment.question.programming.lowestGradingPriorityHint',
    defaultMessage:
      "If enabled, this question's evaluation will always use the evaluator of the lowest priority. If unsure, just leave this unchecked.",
  },
  seeBuildLog: {
    id: 'course.assessment.question.programming.seeBuildLog',
    defaultMessage: 'See the build log',
  },
  packageImportSuccess: {
    id: 'course.assessment.question.programming.packageImportSuccess',
    defaultMessage: 'The package was successfully imported.',
  },
  packageImportInvalidPackage: {
    id: 'course.assessment.question.programming.packageImportInvalidPackage',
    defaultMessage:
      'The package could not be imported: the uploaded package does not have a valid structure.',
  },
  packageImportEvaluationTimeout: {
    id: 'course.assessment.question.programming.packageImportEvaluationTimeout',
    defaultMessage:
      'No response was received from an evaluator within the required time. This may indicate all our evaluators are busy right now, please try again later.',
  },
  packageImportTimeLimitExceeded: {
    id: 'course.assessment.question.programming.packageImportTimeLimitExceeded',
    defaultMessage:
      'The solution did not finish evaluating the test cases in the specified time limit.',
  },
  packageImportEvaluationError: {
    id: 'course.assessment.question.programming.packageImportEvaluationError',
    defaultMessage:
      'An error occurred evaluating your solution against its test cases. Please double-check them and try again.',
  },
  packageImportGenericError: {
    id: 'course.assessment.question.programming.packageImportGenericError',
    defaultMessage: 'The package could not be imported: {error}',
  },
  packagePending: {
    id: 'course.assessment.question.programming.packagePending',
    defaultMessage: 'Package is still being imported. Come back again later?',
  },
  templateMode: {
    id: 'course.assessment.question.programming.templateMode',
    defaultMessage: 'Template mode',
  },
  templateModeHint: {
    id: 'course.assessment.question.programming.templateModeHint',
    defaultMessage: 'You cannot change this mode once there are submissions.',
  },
  codeSubmission: {
    id: 'course.assessment.question.programming.codeSubmission',
    defaultMessage: 'Code submission',
  },
  codeSubmissionHint: {
    id: 'course.assessment.question.programming.codeSubmissionHint',
    defaultMessage:
      'Set the submission template below. Students can edit and submit their code in the editor to be compiled and tested.',
  },
  fileSubmission: {
    id: 'course.assessment.question.programming.fileSubmission',
    defaultMessage: 'File submission',
  },
  fileSubmissionHint: {
    id: 'course.assessment.question.programming.fileSubmissionHint',
    defaultMessage:
      'Upload Java files as submission templates. Students can edit online or upload their Java files to be compiled and tested.',
  },
  javaTestCasesHint: {
    id: 'course.assessment.question.programming.javaTestCasesHint',
    defaultMessage:
      'Expressions will be evaluated in the context of the submitted code. Their return values will be compared against ' +
      'the Expected expectations using the <code>expectEquals(expression, expected)</code> void. Its simplified definition ' +
      'is as follows, where <code>Object</code> has been overloaded for all Java primitives.',
  },
  javaTestCasesHint2: {
    id: 'course.assessment.question.programming.javaTestCasesHint2',
    defaultMessage:
      '<code>printValue(Object val)</code> will be called on all Expressions and Expected expectations by default. Its ' +
      'simplified definition is as follows, where <code>Object</code> has been overloaded for all Java primitives.',
  },
  javaTestCasesHint3: {
    id: 'course.assessment.question.programming.javaTestCasesHint3',
    defaultMessage:
      'If you wish to override these behaviours, you may redefine these methods in <append>Append</append> above.',
  },
  pythonTestCasesHint: {
    id: 'course.assessment.question.programming.pythonTestCasesHint',
    defaultMessage:
      'Expressions will be evaluated in the context of the submitted code. Their return values will then be compared ' +
      'against the Expected expectations using the equality operator (<code>==</code>). Notably, <code>print()</code> ' +
      'returns <code>None</code>, so <code>print</code>ed outputs should not be confused with actual return values.',
  },
  standardInputOutputTestCasesHint: {
    id: 'course.assessment.question.programming.standardInputOutputTestCasesHint',
    defaultMessage:
      'Each test case launches a separate {language} console environment and provides input via standard input. ' +
      'The environment will combine the <prepend>Prepend</prepend>, student submission, and <append>Append</append> scripts into a single program and run it. ' +
      'The standard output of the program will be compared (as a string) to the expected output of the test case. ' +
      'We recommend handling input parsing and function calls in one of these scripts.',
  },
  inlineCode: {
    id: 'course.assessment.question.programming.inlineCode',
    defaultMessage: 'Inline code',
  },
  language: {
    id: 'course.assessment.question.programming.language',
    defaultMessage: 'Language',
  },
  evaluateAndTestCode: {
    id: 'course.assessment.question.programming.evaluateAndTestCode',
    defaultMessage: 'Evaluate and test code',
  },
  evaluateAndTestCodeHint: {
    id: 'course.assessment.question.programming.evaluateAndTestCodeHint',
    defaultMessage:
      'If enabled, Coursemology can run, evaluate, and test submission codes when submitted. You can configure the ' +
      'evaluation package (parameters, data files, and test cases) below.',
  },
  cannotDisableHasSubmissions: {
    id: 'course.assessment.question.programming.cannotDisableHasSubmissions',
    defaultMessage:
      'You cannot disable this option once there are submissions.',
  },
  packageCreationMode: {
    id: 'course.assessment.question.programming.packageCreationMode',
    defaultMessage: 'Package creation mode',
  },
  packageCreationModeHint: {
    id: 'course.assessment.question.programming.packageCreationModeHint',
    defaultMessage:
      'You cannot change this mode once this question is successfully created. Choose wisely!',
  },
  editOnline: {
    id: 'course.assessment.question.programming.editOnline',
    defaultMessage: 'Create/edit online',
  },
  editOnlineHint: {
    id: 'course.assessment.question.programming.editOnlineHint',
    defaultMessage:
      'Do everything right here in this page. Useful for quick edits (especially exams) or collaborating with other ' +
      'instructors.',
  },
  uploadPackage: {
    id: 'course.assessment.question.programming.uploadPackage',
    defaultMessage: 'Manually create/edit offline and upload',
  },
  uploadPackageHint: {
    id: 'course.assessment.question.programming.uploadPackageHint',
    defaultMessage:
      "Pack the package as a ZIP file, then upload it here. Useful for complex test cases or if you host your course's " +
      'evaluation packages in some version control system (e.g., Git, Mercurial, etc.).',
  },
  packageInfoOnline: {
    id: 'course.assessment.question.programming.packageInfoOnline',
    defaultMessage: 'Generated evaluation package',
  },
  packageInfoOnlineHint: {
    id: 'course.assessment.question.programming.packageInfoOnlineHint',
    defaultMessage:
      'This package is generated from this online editor. You may download it for future reference.',
  },
  packageInfoUpload: {
    id: 'course.assessment.question.programming.packageInfoUpload',
    defaultMessage: 'Latest uploaded package',
  },
  packageInfoUploadHint: {
    id: 'course.assessment.question.programming.packageInfoUploadHint',
    defaultMessage: 'Previews extracted from this package is shown below.',
  },
  lastUpdated: {
    id: 'course.assessment.question.programming.lastUpdated',
    defaultMessage: 'Last updated by {by} on {on}.',
  },
  uploadNewPackage: {
    id: 'course.assessment.question.programming.uploadNewPackage',
    defaultMessage: 'Upload a new package',
  },
  uploadNewPackageHint: {
    id: 'course.assessment.question.programming.uploadNewPackageHint',
    defaultMessage:
      'All existing submissions will be evaluated against this new package once it is successfully imported.',
  },
  packageIsZipOnly: {
    id: 'course.assessment.question.programming.packageIsZipOnly',
    defaultMessage: 'Evaluation packages are in ZIPs only.',
  },
  questionSavedRedirecting: {
    id: 'course.assessment.question.programminquestion.questionSavedRedirecting',
    defaultMessage: 'Question saved.',
  },
  evaluatingSubmissions: {
    id: 'course.assessment.question.programming.evaluatingSubmissions',
    defaultMessage:
      'Hold tight, evaluating all submissions with the new package...',
  },
  questionSavedButPackageError: {
    id: 'course.assessment.question.programming.questionSavedButPackageError',
    defaultMessage:
      "Your changes was saved, but the package wasn't successfully imported.",
  },
  errorWhenSavingQuestion: {
    id: 'course.assessment.question.programming.errorWhenSavingQuestion',
    defaultMessage: 'An error occurred when saving your changes.',
  },
  languageAndEvaluation: {
    id: 'course.assessment.question.programming.languageAndEvaluation',
    defaultMessage: 'Language and evaluation',
  },
  noTestCases: {
    id: 'course.assessment.question.programming.noTestCases',
    defaultMessage: 'No test cases.',
  },
  addTestCaseToBegin: {
    id: 'course.assessment.question.programming.addTestCaseToBegin',
    defaultMessage: 'Add a test case to get started. ↗',
  },
  expression: {
    id: 'course.assessment.question.programming.expression',
    defaultMessage: 'Expression',
  },
  expected: {
    id: 'course.assessment.question.programming.expected',
    defaultMessage: 'Expected',
  },
  hint: {
    id: 'course.assessment.question.programming.hint',
    defaultMessage: 'Hint',
  },
  input: {
    id: 'course.assessment.question.programming.input',
    defaultMessage: 'Input',
  },
  expectedOutput: {
    id: 'course.assessment.question.programming.expectedOutput',
    defaultMessage: 'Expected Output',
  },
  addTestCase: {
    id: 'course.assessment.question.programming.addTestCase',
    defaultMessage: 'Add a test case',
  },
  atLeastOneTestCaseRequired: {
    id: 'course.assessment.question.programming.atLeastOneTestCaseRequired',
    defaultMessage: 'At least one test case is required.',
  },
  hasToBeValidNumber: {
    id: 'course.assessment.question.programming.hasToBeValidNumber',
    defaultMessage: 'Has to be a valid positive number.',
  },
  hasToBeAtLeastOne: {
    id: 'course.assessment.question.programming.hasToBeAtLeastOne',
    defaultMessage: 'Has to be a valid positive number at least 1.',
  },
  cannotBeMoreThanMaxLimit: {
    id: 'course.assessment.question.programming.cannotBeMoreThanMaxLimit',
    defaultMessage: 'Cannot be more than {max} s.',
  },
  automatedFeedback: {
    id: 'course.assessment.question.programming.automatedFeedback',
    defaultMessage: 'Get Help',
  },
  enableLiveFeedback: {
    id: 'course.assessment.question.programming.enableLiveFeedback',
    defaultMessage: 'Allow Get Help',
  },
  enableLiveFeedbackDescription: {
    id: 'course.assessment.question.programming.enableLiveFeedbackDescription',
    defaultMessage:
      'Allow students to request live programming help during submission attempts. (AI-generated feedback may not always be accurate.)',
  },
  liveFeedbackCustomPrompt: {
    id: 'course.assessment.question.programming.liveFeedbackCustomPrompt',
    defaultMessage: 'Custom Prompt',
  },
  liveFeedbackCustomPromptDescription: {
    id: 'course.assessment.question.programming.liveFeedbackCustomPromptDescription',
    defaultMessage:
      'Add instructions to guide the generation of Get Help feedback here. If unsure, just leave this blank.',
  },
  savingChanges: {
    id: 'course.assessment.question.programming.savingChanges',
    defaultMessage: 'Saving your changes...',
  },
  submitConfirmation: {
    id: 'course.assessment.question.programming.submitConfirmation',
    defaultMessage:
      'There are existing submissions for this autograded question. Updating this question will regrade all ' +
      'submitted answers to this question and only system-issued EXP for the submissions will be re-calculated. ' +
      'Note that manually-issued EXP will not be updated. Are you sure you wish to continue?',
  },
  mustUploadPackage: {
    id: 'course.assessment.question.programming.mustUploadPackage',
    defaultMessage: 'Please specify a valid evaluation package ZIP file.',
  },
  autogradedAssessmentButNoEvaluationWarning: {
    id: 'course.assessment.question.programming.autogradedAssessmentButNoEvaluationWarning',
    defaultMessage:
      "This assessment is autograded. If code evaluation and testing is disabled, this question's " +
      'submissions will always receive the maximum grade above since there are nothing for the autograder to test ' +
      'and grade.',
  },
  languageDeprecatedWarning: {
    id: 'course.assessment.question.programming.languageDeprecatedWarning',
    defaultMessage:
      'Your selected language is deprecated. Please change it to another language.',
  },
  defaultEvaluatorNotSupported: {
    id: 'course.assessment.question.programming.defaultEvaluatorNotSupported',
    defaultMessage: '{languageName} is not supported by the default evaluator.',
  },
  codaveriEvaluatorNotSupported: {
    id: 'course.assessment.question.programming.codaveriEvaluatorNotSupported',
    defaultMessage:
      '{languageName} is not supported by the Codaveri evaluator.',
  },
  liveFeedbackNotSupported: {
    id: 'course.assessment.question.programming.liveFeedbackNotSupported',
    defaultMessage: 'Get Help is not supported for {languageName}.',
  },
});

export default translations;
