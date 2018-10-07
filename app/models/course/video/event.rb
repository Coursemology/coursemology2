# frozen_string_literal: true
class Course::Video::Event < ApplicationRecord
  include Course::Video::IntervalQueryConcern

  validates :session, presence: true
  validates :sequence_num, presence: true
  validates :video_time, numericality: { greater_than_or_equal_to: 0 }
  validates_presence_of :event_type
  validates_numericality_of :video_time, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :video_time
  validates_presence_of :event_time
  validates_numericality_of :playback_rate, allow_nil: true
  validates_presence_of :session

  belongs_to :session, inverse_of: :events

  upsert_keys [:session_id, :sequence_num]

  enum event_type: [:play, :pause, :speed_change, :seek_start, :seek_end, :buffer, :end]
end
