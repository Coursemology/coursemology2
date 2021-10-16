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
  allowAttachment: PropTypes.bool,
  description: PropTypes.string.isRequired,
  displayTitle: PropTypes.string.isRequired,
  language: PropTypes.string,
  maximumGrade: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(optionShape),
  type: PropTypes.string.isRequired,
  answerId: PropTypes.number,
  topicId: PropTypes.number.isRequired,
  autogradable: PropTypes.bool,
  viewHistory: PropTypes.bool,
  canViewHistory: PropTypes.bool,
});

export const historyQuestionShape = PropTypes.shape({
  loaded: PropTypes.bool,
  isLoading: PropTypes.bool,
  answerIds: PropTypes.arrayOf(PropTypes.number),
  selected: PropTypes.arrayOf(PropTypes.number),
});

export const fileShape = PropTypes.shape({
  content: PropTypes.string,
  filename: PropTypes.string,
  id: PropTypes.number,
  staged: PropTypes.bool,
});

export const questionGradeShape = PropTypes.shape({
  grade: PropTypes.number,
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
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }),
  createdAt: PropTypes.string.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  canDestroy: PropTypes.bool.isRequired,
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

export const explanationShape = PropTypes.shape({
  correct: PropTypes.bool,
  explanations: PropTypes.arrayOf(PropTypes.string),
});

export const attachmentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
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
  tabbedView: PropTypes.bool,
  showPrivate: PropTypes.bool,
  showEvaluation: PropTypes.bool,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  canViewLogs: PropTypes.bool,
  canUnsubmitSubmissions: PropTypes.bool,
  canDeleteSubmission: PropTypes.bool,
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
  grader: PropTypes.string,
  late: PropTypes.bool,
  pointsAwarded: PropTypes.number,
  submittedAt: PropTypes.string,
  submitter: PropTypes.string,
  workflowState: PropTypes.string,
});

export const reduxFormShape = PropTypes.shape({
  registeredField: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.any,
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

export const questionFlagsShape = PropTypes.shape({
  jobError: PropTypes.bool.isRequired,
  isAutograding: PropTypes.bool.isRequired,
  isResetting: PropTypes.bool.isRequired,
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
  topicPostPacks: PropTypes.shape({
    topic: topicOverviewShape,
    postpacks: postPackShape,
  }),
})
