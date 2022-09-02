# frozen_string_literal: true
class Course::Assessment::Submission::AutoFeedbackJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  # Performs the auto feedback.
  #
  # @param [Course::Assessment::Submission] submission The object to store the feedback
  #   results into.
  def perform_tracked(submission)
    instance = Course.unscoped { submission.assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      submission.current_answers.each do |current_answer|
        if current_answer.specific.respond_to?(:retrieve_codaveri_code_feedback)
          current_answer.specific.retrieve_codaveri_code_feedback
        end
      end
    end
  end
end
