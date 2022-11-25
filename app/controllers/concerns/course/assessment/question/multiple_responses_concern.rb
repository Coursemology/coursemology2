# frozen_string_literal: true
module Course::Assessment::Question::MultipleResponsesConcern
  extend ActiveSupport::Concern

  def switch_mcq_mrq_type(is_mcq, unsubmit)
    grading_scheme = is_mcq ? :any_correct : :all_correct

    result = @multiple_response_question.update(grading_scheme: grading_scheme)
    if result
      unsubmit_submissions if unsubmit
    else
      @multiple_response_question.reload
    end

    result
  end

  def unsubmit_submissions
    submission_ids = @question_assessment.assessment.submissions.pluck(:id)
    Course::Assessment::Submission::UnsubmittingJob.
      perform_later(current_user,
                    submission_ids,
                    @assessment,
                    @multiple_response_question.question).job
  end
end
