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
    @payload = { feedback_id: feedback.codaveri_feedback_id,
                 updated_feedback: feedback.post.text,
                 rating: feedback.rating }
  end

  def send_codaveri_feedback_rating
    post_response = connect_to_codaveri

    response_status = post_response.status
    response_body = valid_json(post_response.body)
    response_success = response_body['success']

    return 'Rating successfully sent!' if response_status == 200 && response_success

    Rails.logger.debug(message: 'Send Feedback Rating Error',
                       response_status: response_status)
    false
  end

  def connect_to_codaveri
    connection = Excon.new('https://api.codaveri.com/feedback/rating')
    connection.post(
      headers: {
        'x-api-key' => ENV['CODAVERI_API_KEY'],
        'Content-Type' => 'application/json'
      },
      body: @payload.to_json
    )
  end

  def valid_json(json)
    JSON.parse(json)
  rescue JSON::ParserError => _e
    { 'success' => false, 'message' => json }
  end
end
