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
});

const fileShape = PropTypes.shape({
  content: PropTypes.string,
  filename: PropTypes.string,
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
  autograded: PropTypes.bool,
  delayedGradePublication: PropTypes.bool,
  description: PropTypes.string,
  published: PropTypes.bool,
  skippable: PropTypes.bool,
  tabbedView: PropTypes.bool,
  title: PropTypes.string,
  questionIds: PropTypes.arrayOf(PropTypes.number),
});

export const submissionShape = PropTypes.shape({
  attempted_at: PropTypes.string,
  basePoints: PropTypes.number,
  canGrade: PropTypes.bool,
  canUpdate: PropTypes.bool,
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
  image_path: PropTypes.string,
  user_id: PropTypes.number,
  answer_id: PropTypes.number,
});

export const scribingShape = PropTypes.shape({
  answer: scribingAnswerShape,
  canvas: PropTypes.object,
  isCanvasLoaded: PropTypes.bool,
  isLoading: PropTypes.bool,
  isSaving: PropTypes.bool,
  isSaved: PropTypes.bool,
  hasError: PropTypes.bool,
});
