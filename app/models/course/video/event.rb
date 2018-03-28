# frozen_string_literal: true
class Course::Video::Event < ApplicationRecord
  belongs_to :session, inverse_of: :events

  upsert_keys [:session_id, :sequence_num]

  schema_validations except: [:session_id, :sequence_num]
  validates :session, presence: true
  validates :sequence_num, presence: true
  validates :video_time, numericality: { greater_than_or_equal_to: 0 }

  enum event_type: [:play, :pause, :speed_change, :seek_start, :seek_end, :buffer, :end]

  START_TYPES = [:play, :seek_end].freeze
  END_TYPES = [:pause, :seek_start, :end].freeze

  scope :start_events, -> { where(event_type: type_sym_to_id(START_TYPES)) }
  scope :end_events, -> { where(event_type: type_sym_to_id(END_TYPES)) }

  private

  def type_sym_to_id(symbols)
    symbols.map { |sym| Course::Video::Event.event_types[sym] }
  end
end
