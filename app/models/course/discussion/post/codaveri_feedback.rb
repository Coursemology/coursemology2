# frozen_string_literal: true
class Course::Discussion::Post::CodaveriFeedback < ApplicationRecord
  enum :status, { pending_review: 0, accepted: 1, rejected: 2 }
  validates :codaveri_feedback_id, presence: true
  validates :original_feedback, presence: true

  belongs_to :post, inverse_of: :codaveri_feedback

  after_commit :send_rating_to_codaveri, on: :update

  private

  def send_rating_to_codaveri
    return false if !rating || status == 'pending_review'

    case status
    when 'accepted'
      Course::Discussion::Post::CodaveriFeedbackRatingJob.perform_later(self)
    when 'rejected'
      Course::Discussion::Post::CodaveriFeedbackRatingJob.perform_now(self)
    end
  end
end
