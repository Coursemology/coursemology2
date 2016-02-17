# frozen_string_literal: true
module Course::Assessment::SubmissionControllerWorksheetConcern
  extend ActiveSupport::Concern

  private

  def question_to_attempt_worksheet
    @submission.assessment.questions
  end
end
