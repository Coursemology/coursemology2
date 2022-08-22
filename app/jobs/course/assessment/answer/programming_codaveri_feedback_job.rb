# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingCodaveriFeedbackJob < ApplicationJob
  include TrackableJob

  protected

  def perform_tracked(assessment, question, answer)
    ActsAsTenant.without_tenant do
      feedback_service = Course::Assessment::Answer::ProgrammingCodaveriFeedbackService.
                         new(assessment, question, answer)
      feedback_service.run_codaveri_feedback_service
    end
  end
end
