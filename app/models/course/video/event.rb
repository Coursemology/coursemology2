# frozen_string_literal: true
class Course::Video::Event < ApplicationRecord
  belongs_to :session, inverse_of: :events

  validates :event_type, presence: true
  validates :video_time, presence: true
  validates :video_time, numericality: { greater_than_or_equal_to: 0 }
  validates :event_time, presence: true
  validates :sequence_num, uniqueness: { scope: :session_id }

  enum event_type: [:play, :pause, :speed_change, :seek_start, :seek_end, :buffer, :end]
end
