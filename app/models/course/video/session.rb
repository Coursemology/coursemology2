# frozen_string_literal: true
class Course::Video::Session < ApplicationRecord
  belongs_to :submission, inverse_of: :sessions
  has_many :events, inverse_of: :session, dependent: :destroy

  validates :session_start, presence: true
  validates :session_end, presence: true
  validate :validate_start_before_end

  private

  def validate_start_before_end
    return unless session_start > session_end
    errors.add(:session_start, :cannot_be_after_session_end)
  end
end
