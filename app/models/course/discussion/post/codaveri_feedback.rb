# frozen_string_literal: true
class Course::Discussion::Post::CodaveriFeedback < ApplicationRecord
  enum status: { pending_review: 0, accepted: 1 }
  validates :codaveri_feedback_id, presence: true
  validates :original_feedback, presence: true

  belongs_to :post, inverse_of: :codaveri_feedback

  after_commit :send_rating_to_codaveri

  private

  def send_rating_to_codaveri
    return if !rating || status == :pending_review

    payload = { feedback_id: codaveri_feedback_id,
                updated_feedback: post.text,
                rating: rating }

    # For debugging purpose
    # File.write('codaveri_rating_test.json', payload.to_json)
    send_codaveri_feedback_rating(payload)
  end

  def send_codaveri_feedback_rating(payload)
    connection = Excon.new('https://api.codaveri.com/feedback/rating')
    post_response = connection.post(
      headers: {
        'x-api-key' => 'TkRsKLtz6A==.79f85119-80b9-4e38-9b6b-74e45735be6c',
        'Content-Type' => 'application/json'
      },
      body: payload.to_json
    )

    response_status = post_response.status
    response_body = JSON.parse(post_response.body)
    response_success = response_body['success']

    return if response_status == 200 && response_success

    Rails.logger.debug(message: 'Send Feedback Rating Error',
                       response_status: response_status)
  end
end
