# frozen_string_literal: true
module Course::Statistics::AssessmentsHelper
  # Return the number of attempts and also the correctness status of the last
  # submission by the submitter
  #
  # if the submission is still being attempted, then we return the last non-current
  # attempt or current_answer in case there is no last non-current attempt
  #
  # this method is basically similar with the one defined inside the SubmissionHelper
  # but this one avoids the n+1 problem that exists within the SubmissionHelper
  #
  # we cannot afford having the n+1 problem in here, since we will iterate over all
  # answers from all existing submissions within the assessment

  def attempt_status(submission, question_id)
    attempts = submission.answers.select { |answer| answer.question_id == question_id }
    last_non_current_answer = attempts.reject(&:current_answer?).last
    current_answer = attempts.find(&:current_answer?)
    # Fallback to last attempt if none of the attempts have been autograded.
    latest_attempt = last_non_current_answer || attempts.last

    last_attempt = submission.attempting? ? latest_attempt : current_answer
    [attempts.length, last_attempt.correct]
  end
end
