import PropTypes from 'prop-types';

const optionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  option: PropTypes.string.isRequired,
  correct: PropTypes.bool,
});

export const testCaseShape = PropTypes.shape({
  identifier: PropTypes.string.isRequired,
  expression: PropTypes.string.isRequired,
  expected: PropTypes.string.isRequired,
  hint: PropTypes.string,
});

export const questionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  maximumGrade: PropTypes.number.isRequired,
  autogradable: PropTypes.bool.isRequired,
  canViewHistory: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,

  questionNumber: PropTypes.number.isRequired,
  questionTitle: PropTypes.string.isRequired,
  submissionQuestionId: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  answerId: PropTypes.number,

  // Below are props of specific question type (ie MCQ, programming)
  // The list is definitely incomplete and wont be fixed
  // as we are moving to Typescript
  allowAttachment: PropTypes.bool,
  language: PropTypes.string,
  editorMode: PropTypes.string,
  options: PropTypes.arrayOf(optionShape),

  // Below are added in Redux
  attemptsLeft: PropTypes.number,
});

export const fileShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  filename: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  highlightedContent: PropTypes.oneOfType([PropTypes.string, null]),
  staged: PropTypes.bool,
});

export const questionGradeShape = PropTypes.shape({
  grade: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  originalGrade: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  grader: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number,
  }),
});

export const gradingShape = PropTypes.shape({
  questions: PropTypes.objectOf(questionGradeShape),
  exp: PropTypes.number,
  expMultiplier: PropTypes.number,
});

export const postShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  title: PropTypes.string,
  text: PropTypes.string,
  creator: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
  }),
  createdAt: PropTypes.string.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  canDestroy: PropTypes.bool.isRequired,
  isDelayed: PropTypes.bool.isRequired,
  codaveriFeedback: PropTypes.shape({
    id: PropTypes.number,
    status: PropTypes.string,
    originalFeedback: PropTypes.string,
    rating: PropTypes.number,
  }),
  isAiGenerated: PropTypes.bool.isRequired,
  workflowState: PropTypes.oneOf(['draft', 'published', 'delayed', 'answering'])
    .isRequired,
});

export const answerShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  questionId: PropTypes.number.isRequired,
  answer_text: PropTypes.string,
  file: PropTypes.object,
  files: PropTypes.arrayOf(fileShape),
  option_ids: PropTypes.arrayOf(PropTypes.number),
  createdAt: PropTypes.string,
});

export const attachmentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
});

export const assessmentShape = PropTypes.shape({
  categoryId: PropTypes.number,
  tabId: PropTypes.number,
  title: PropTypes.string,
  description: PropTypes.string,
  autograded: PropTypes.bool,
  delayedGradePublication: PropTypes.bool,
  published: PropTypes.bool,
  skippable: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  showRubricToStudents: PropTypes.bool,
  tabbedView: PropTypes.bool,
  showPrivate: PropTypes.bool,
  showEvaluation: PropTypes.bool,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  canViewLogs: PropTypes.bool,
  canPublishGrades: PropTypes.bool,
  canForceSubmit: PropTypes.bool,
  canUnsubmitSubmissions: PropTypes.bool,
  canDeleteAllSubmissions: PropTypes.bool,
});

export const submissionShape = PropTypes.shape({
  attempted_at: PropTypes.string,
  basePoints: PropTypes.number,
  bonusPoints: PropTypes.number,
  isGrader: PropTypes.bool, // Indicates whether the current user is a grader or not.
  graderView: PropTypes.bool, // Grader can set graderView to false to preview as student.
  showPublicTestCasesOutput: PropTypes.bool,
  canUpdate: PropTypes.bool,
  bonusEndAt: PropTypes.string,
  dueAt: PropTypes.string,
  grade: PropTypes.number,
  gradedAt: PropTypes.string,
  grader: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  late: PropTypes.bool,
  pointsAwarded: PropTypes.number,
  submittedAt: PropTypes.string,
  submitter: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  workflowState: PropTypes.string,
});

export const topicShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  posts: PropTypes.arrayOf(PropTypes.number),
});

export const annotationShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  line: PropTypes.number.isRequired,
  postIds: PropTypes.arrayOf(PropTypes.number),
});

export const scribbleShape = PropTypes.shape({
  content: PropTypes.string,
});

export const scribingAnswerShape = PropTypes.shape({
  scribbles: PropTypes.arrayOf(scribbleShape),
  image_url: PropTypes.string,
  user_id: PropTypes.number,
  answer_id: PropTypes.number,
});

export const scribingShape = PropTypes.shape({
  answer: scribingAnswerShape,
  layers: PropTypes.arrayOf(scribbleShape),
  selectedTool: PropTypes.string,
  selectedShape: PropTypes.string,
  imageWidth: PropTypes.number,
  imageHeight: PropTypes.number,
  fontFamily: PropTypes.string,
  fontSize: PropTypes.number,
  colors: PropTypes.object,
  lineStyles: PropTypes.object,
  thickness: PropTypes.object,
  activeObject: PropTypes.object,
  cursor: PropTypes.string,
  currentStateIndex: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  canvasStates: PropTypes.array,
  canvasZoom: PropTypes.number,
  canvasWidth: PropTypes.number,
  canvasHeight: PropTypes.number,
  canvasMaxWidth: PropTypes.number,
  isCanvasLoaded: PropTypes.bool,
  isDrawingMode: PropTypes.bool,
  isChangeTool: PropTypes.bool,
  isDelete: PropTypes.bool,
  isLoading: PropTypes.bool,
  isSaving: PropTypes.bool,
  isSaved: PropTypes.bool,
  hasError: PropTypes.bool,
});

export const forumPostShape = PropTypes.shape({
  id: PropTypes.number,
  text: PropTypes.string,
  updatedAt: PropTypes.string,
  isUpdated: PropTypes.bool,
  isDeleted: PropTypes.bool,
  userName: PropTypes.string,
  avatar: PropTypes.string,
});

export const forumOverviewShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
});

export const topicOverviewShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  isDeleted: PropTypes.bool,
});

export const postPackShape = PropTypes.shape({
  corePost: forumPostShape,
  parentPost: forumPostShape,
  forum: forumOverviewShape,
  topic: topicOverviewShape,
});

export const forumTopicPostPackShape = PropTypes.shape({
  course: PropTypes.shape({
    id: PropTypes.number,
  }),
  forum: forumOverviewShape,
  topicPostPacks: PropTypes.arrayOf(
    PropTypes.shape({
      topic: topicOverviewShape,
      postPacks: PropTypes.arrayOf(postPackShape),
    }),
  ),
});

export const codaveriFeedbackStatusShape = PropTypes.shape({
  jobStatus: PropTypes.oneOf(['submitted', 'completed', 'errored']),
  errorMessage: PropTypes.string,
});
