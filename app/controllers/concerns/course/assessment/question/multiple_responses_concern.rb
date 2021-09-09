# frozen_string_literal: true
module Course::Assessment::Question::MultipleResponsesConcern
  extend ActiveSupport::Concern

  def switch_mcq_mrq_type(multiple_choice)
    if multiple_choice == 'true'
      @multiple_response_question.grading_scheme = :any_correct
    elsif multiple_choice == 'false'
      @multiple_response_question.grading_scheme = :all_correct
    end
    @multiple_response_question.save!
    unsubmit_submissions
    @multiple_response_question.question.answers.destroy_all
  end

  def unsubmit_submissions
    @question_assessment.assessment.submissions.each do |submission|
      submission.update('unsubmit' => 'true') unless submission.attempting?
    end
  end
end
