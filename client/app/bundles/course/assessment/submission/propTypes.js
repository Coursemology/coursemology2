import PropTypes from 'prop-types';

const OptionProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    option: PropTypes.string.isRequired,
    correct: PropTypes.bool,
  });

export const TestCaseProp =
  PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    expression: PropTypes.string.isRequired,
    expected: PropTypes.string.isRequired,
    hint: PropTypes.string,
  });

export const QuestionProp =
PropTypes.shape({
  allowAttachment: PropTypes.bool,
  description: PropTypes.string.isRequired,
  displayTitle: PropTypes.string.isRequired,
  language: PropTypes.string,
  maximumGrade: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(OptionProp),
  type: PropTypes.string.isRequired,
  answerId: PropTypes.number,
  topicId: PropTypes.number.isRequired,
});

const FileProp =
  PropTypes.shape({
    content: PropTypes.string,
    filename: PropTypes.string,
  });

export const QuestionGradeProp = PropTypes.shape({
  grade: PropTypes.number,
  grader: PropTypes.string,
});

export const GradingProp = PropTypes.shape({
  questions: PropTypes.objectOf(QuestionGradeProp),
  exp: PropTypes.number,
  expMultiplier: PropTypes.number,
});

export const PostProp =
  PropTypes.shape({
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

export const AnswerProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    questionId: PropTypes.number.isRequired,
    answer_text: PropTypes.string,
    file: PropTypes.object,
    files: PropTypes.arrayOf(FileProp),
    option_ids: PropTypes.arrayOf(PropTypes.number),
  });

export const ExplanationProp =
  PropTypes.shape({
    correct: PropTypes.bool,
    explanations: PropTypes.arrayOf(PropTypes.string),
  });

export const AttachmentProp =
  PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  });

export const AssessmentProp =
  PropTypes.shape({
    autograded: PropTypes.bool,
    delayedGradePublication: PropTypes.bool,
    description: PropTypes.string,
    published: PropTypes.bool,
    skippable: PropTypes.bool,
    tabbedView: PropTypes.bool,
    title: PropTypes.string,
    questionIds: PropTypes.arrayOf(PropTypes.number),
  });

export const SubmissionProp =
  PropTypes.shape({
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

export const ReduxFormProp =
  PropTypes.shape({
    registeredField: PropTypes.object,
    values: PropTypes.any,
  });

export const TopicProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    posts: PropTypes.arrayOf(PropTypes.number),
  });

export const AnnotationProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    line: PropTypes.number.isRequired,
    postIds: PropTypes.arrayOf(PropTypes.number),
  });

export const QuestionFlagsProp =
  PropTypes.shape({
    hasError: PropTypes.bool.isRequired,
    isAutograding: PropTypes.bool.isRequired,
    isResetting: PropTypes.bool.isRequired,
  });
