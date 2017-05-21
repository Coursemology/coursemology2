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
  allowAttachment: PropTypes.bool,
  description: PropTypes.string.isRequired,
  displayTitle: PropTypes.string.isRequired,
  language: PropTypes.string,
  maximumGrade: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(OptionProp),
  type: PropTypes.string.isRequired,
  answerId: PropTypes.number.isRequired,
  explanationId: PropTypes.number,
  topicId: PropTypes.number.isRequired,
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
    id: PropTypes.number.isRequired,
    questionId: PropTypes.number.isRequired,
    answer_text: PropTypes.string,
    file: PropTypes.object,
    files: PropTypes.arrayOf(FileProp),
    option_ids: PropTypes.arrayOf(PropTypes.number),
    correct: PropTypes.bool,
    explanations: PropTypes.arrayOf(PropTypes.string),
  });

export const AssessmentProp =
  PropTypes.shape({
    autograded: PropTypes.bool.isRequired,
    delayedGradePublication: PropTypes.bool.isRequired,
    description: PropTypes.string,
    published: PropTypes.bool,
    skippable: PropTypes.bool.isRequired,
    tabbedView: PropTypes.bool.isRequired,
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
