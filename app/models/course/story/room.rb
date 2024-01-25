# frozen_string_literal: true
class Course::Story::Room < ApplicationRecord
  belongs_to :story, inverse_of: :rooms

  validates :story, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  def completed=(now_completed)
    if now_completed && !completed?
      self.completed_at = Time.zone.now
    elsif !now_completed && completed?
      self.completed_at = nil
    end
  end

  def completed?
    completed_at.present?
  end
end
