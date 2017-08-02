# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsHelper
  include Course::Assessment::Submission::SubmissionsAutogradedHelper
  include Course::Assessment::Submission::SubmissionsWorkflowStateHelper
  include Course::Assessment::Answer::ProgrammingHelper
  include Course::Assessment::Answer::ProgrammingTestCaseHelper

  # Gets the ID for the given submission_question's comments container.
  #
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission_question
  #   to get the ID for
  # @return [String] The ID for the given submission_question's comments container.
  def comments_container_id(submission_question)
    "course_assessment_submission_question_#{submission_question.id}_comments"
  end

  # Return the last attempted answer based on the status of current submission.
  # previous attempt if submission is in attempting state.
  # current attempt if submission is in submitted, graded or published state.
  #
  # @return [Course::Assessment::Answer]
  def last_attempt(answer)
    submission = answer.submission
    attempts = submission.answers.from_question(answer.question_id)
    submission.attempting? ? attempts[-2] : attempts[-1]
  end
end
