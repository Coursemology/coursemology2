# frozen_string_literal: true
class Course::Discussion::Post::CodaveriFeedbackRatingService
  class << self
    # Create or update the programming question attachment to Codaveri.
    #
    # @param [Course::Assessment::Question::Programming] question The programming question to
    #   be created in the Codaveri service.
    # @param [Attachment] attachment The attachment containing the package to be converted and sent to Codaveri.
    def send_feedback(codaveri_feedback)
      new(codaveri_feedback).send_codaveri_feedback
    end
  end

  def send_codaveri_feedback
    send_codaveri_feedback_rating
  end

  private

  # Creates a new service codaveri feedback rating object.
  #
  # @param [Course::Discussion::Post::CodaveriFeedback] feedback Feedback to be sent to Codaveri
  def initialize(feedback)
    @feedback = feedback
    @course = feedback.post.topic.course
    @payload = { id: feedback.codaveri_feedback_id,
                 updatedFeedback: feedback.post.text,
                 rating: feedback.rating }
  end

  def send_codaveri_feedback_rating
    codaveri_api_service = CodaveriAsyncApiService.new('feedback/rating', @payload)
    response_status, response_body = codaveri_api_service.post

    response_success = response_body['success']

    return 'Rating successfully sent!' if response_status == 200 && response_success

    raise CodaveriError, { status: response_status, body: response_body }
  end
end
