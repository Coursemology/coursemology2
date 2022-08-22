# frozen_string_literal: true
class Course::Discussion::Post::CodaveriFeedback < ApplicationRecord
  enum status: { pending_review: 0, accepted: 1 }
  validates :codaveri_feedback_id, presence: true
  validates :original_feedback, presence: true

  belongs_to :post, inverse_of: :codaveri_feedback
end
