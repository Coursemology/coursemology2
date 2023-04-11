# frozen_string_literal: true
class Course::Discussion::Post::CodaveriFeedbackRatingJob < ApplicationJob
  include TrackableJob

  protected

  # Performs the submission download as csv service.
  #
  # @param [Course::Discussion::Post::CodaveriFeedback] codaveri_feedback Feedback with rating to send to Codaveri
  def perform_tracked(codaveri_feedback)
    Course::Discussion::Post::CodaveriFeedbackRatingService.
      send_feedback(codaveri_feedback)
  end
end
