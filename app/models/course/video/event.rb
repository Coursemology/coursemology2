# frozen_string_literal: true
class Course::Video::Event < ApplicationRecord
  include Course::Video::IntervalQueryConcern

  validates :session, presence: true
  validates :sequence_num, presence: true
  validates :video_time, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than: 2_147_483_648 },
                         presence: true
  validates :event_type, presence: true
  validates :event_time, presence: true
  validates :playback_rate, numericality: true, allow_nil: true
  validates :session, presence: true

  belongs_to :session, inverse_of: :events

  upsert_keys [:session_id, :sequence_num]

  enum event_type: [:play, :pause, :speed_change, :seek_start, :seek_end, :buffer, :end]
end
