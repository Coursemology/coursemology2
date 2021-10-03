# frozen_string_literal: true
module Course::Assessment::Question::MultipleResponsesConcern
  extend ActiveSupport::Concern

  def switch_mcq_mrq_type(multiple_choice, unsubmit)
    case multiple_choice
    when 'true'
      grading_scheme = :any_correct
    when 'false'
      grading_scheme = :all_correct
    end

    if @multiple_response_question.update(grading_scheme: grading_scheme)
      unsubmit_submissions unless unsubmit == 'false'
      @multiple_response_question.question.answers.destroy_all unless unsubmit == 'false'
      flash.now[:success] = @message_success_switch
    else
      @multiple_response_question.reload
      flash.now[:danger] = @message_failure_switch
    end
  end

  def unsubmit_submissions
    @question_assessment.assessment.submissions.each do |submission|
      submission.update('unsubmit' => 'true') unless submission.attempting?
    end
  end
end
