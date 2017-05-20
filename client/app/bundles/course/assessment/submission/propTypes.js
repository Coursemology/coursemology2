import { PropTypes } from 'react';

const OptionProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    option: PropTypes.string.isRequired,
    correct: PropTypes.bool,
  });

const TestCaseProp =
  PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    expression: PropTypes.string.isRequired,
    expected: PropTypes.string.isRequired,
    hint: PropTypes.string,
    type: PropTypes.string.isRequired,
  });

export const QuestionProp =
PropTypes.shape({
  allow_attachment: PropTypes.bool,
  description: PropTypes.string.isRequired,
  displayTitle: PropTypes.string.isRequired,
  language: PropTypes.string,
  maximumGrade: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(OptionProp),
  type: PropTypes.string.isRequired,
  answerId: PropTypes.number,
  explanationId: PropTypes.number,
  topicId: PropTypes.number,
  testCases: PropTypes.arrayOf(TestCaseProp),
});

const FileProp =
  PropTypes.shape({
    content: PropTypes.string,
    filename: PropTypes.string,
  });

export const PostProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    topicId: PropTypes.number.isRequired,
    title: PropTypes.string,
    text: PropTypes.string,
    creator: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  });

export const AnswerProp =
  PropTypes.shape({
    answer_text: PropTypes.string,
    file: PropTypes.object,
    files: PropTypes.arrayOf(FileProp),
    option_ids: PropTypes.arrayOf(PropTypes.number),
  });

export const AssessmentProp =
  PropTypes.shape({
    autograded: PropTypes.bool.isRequired,
    delayedGradePublication: PropTypes.bool.isRequired,
    description: PropTypes.string,
    password: PropTypes.string,
    passwordProtected: PropTypes.bool.isRequired,
    published: PropTypes.bool,
    skippable: PropTypes.bool.isRequired,
    tabbedView: PropTypes.bool.isRequired,
    title: PropTypes.string,
  });

export const ProgressProp =
  PropTypes.shape({
    attempted_at: PropTypes.string,
    base_points: PropTypes.number,
    due_at: PropTypes.string,
    grade: PropTypes.number,
    graded_at: PropTypes.string,
    grader: PropTypes.string,
    late: PropTypes.bool,
    points_awarded: PropTypes.number,
    submitted_at: PropTypes.string,
    submitter: PropTypes.string,
    workflow_state: PropTypes.string,
  });

export const ReduxFormProp =
  PropTypes.shape({
    registeredField: PropTypes.object,
    values: PropTypes.any,
  });

export const TopicProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    postIds: PropTypes.arrayOf(PropTypes.number),
  });

export const ExplanationProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    questionId: PropTypes.number.isRequired,
    correct: PropTypes.bool,
    explanations: PropTypes.arrayOf(PropTypes.string).isRequired,
    option_ids: PropTypes.arrayOf(PropTypes.number),
  });
