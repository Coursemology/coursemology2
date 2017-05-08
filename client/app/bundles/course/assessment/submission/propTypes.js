import { PropTypes } from 'react';

export const QuestionProp =
PropTypes.shape({
  description: PropTypes.string.isRequired,
  display_title: PropTypes.string.isRequired,
});

const OptionProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    option: PropTypes.string.isRequired,
  });

const FileProp =
  PropTypes.shape({
    content: PropTypes.string,
    filename: PropTypes.string,
  });

const TestCaseProp =
  PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    expression: PropTypes.string.isRequired,
    expected: PropTypes.string.isRequired,
    hint: PropTypes.string,
    type: PropTypes.string.isRequired,
  });

const PostProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    text: PropTypes.string,
    creator: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  });

export const AnswerProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    allow_attachment: PropTypes.bool,
    answer_text: PropTypes.string,
    file: PropTypes.object,
    files: PropTypes.arrayOf(FileProp),
    language: PropTypes.string,
    options: PropTypes.arrayOf(OptionProp),
    option_ids: PropTypes.arrayOf(PropTypes.number),
    question: QuestionProp.isRequired,
    test_cases: PropTypes.arrayOf(TestCaseProp),
    type: PropTypes.string.isRequired,
  });

export const AssessmentProp =
  PropTypes.shape({
    autograded: PropTypes.bool.isRequired,
    delayed_grade_publication: PropTypes.bool.isRequired,
    description: PropTypes.string,
    password: PropTypes.string,
    password_protected: PropTypes.bool.isRequired,
    published: PropTypes.bool,
    skippable: PropTypes.bool.isRequired,
    tabbed_view: PropTypes.bool.isRequired,
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
    maximum_grade: PropTypes.number,
    points_awarded: PropTypes.number,
    submitted_at: PropTypes.string,
    submitter: PropTypes.string,
    workflow_state: PropTypes.string,
  });

export const SubmissionProp =
  PropTypes.shape({
    answers: PropTypes.arrayOf(AnswerProp),
  });

export const ReduxFormProp =
  PropTypes.shape({
    registeredField: PropTypes.object,
    values: PropTypes.any,
  });

export const TopicProp =
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    posts: PropTypes.arrayOf(PostProp),
  });
