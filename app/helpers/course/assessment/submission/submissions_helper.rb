# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsHelper
  include Course::Assessment::Answer::ProgrammingTestCaseHelper

  # Return the last non-current attempt if the submission is being attempted,
  # or the current_answer if it's in other states.
  # If there are no non-current attempts, just return the current attempt.
  #
  # The last non-current attempt contains the most recent autograding result if the submission is
  # being attempted.
  # When the submission is finalised, current_answer contains the autograding result.
  #
  # @return [Course::Assessment::Answer]
  def last_attempt(answer)
    submission = answer.submission

    attempts = submission.answers.from_question(answer.question_id)
    last_non_current_answer = attempts.reject(&:current_answer?).last
    current_answer = attempts.find(&:current_answer?)
    # Fallback to last attempt if none of the attempts have been autograded.
    latest_attempt = last_non_current_answer || attempts.last

    submission.attempting? ? latest_attempt : current_answer
  end
end
