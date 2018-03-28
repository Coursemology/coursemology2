# frozen_string_literal: true
class Course::Video::Session < ApplicationRecord
  belongs_to :submission, inverse_of: :sessions
  has_many :events, inverse_of: :session, dependent: :destroy

  before_validation :set_session_time, if: :new_record?

  validates :session_start, presence: true
  validates :session_end, presence: true
  validate :validate_start_before_end

  # Inserts (or updates if the sequence number collides) events into this session.
  #
  # @param [[Hash]] events_attributes A list of hashes specifying the attributes for events.
  # @param [Hash] events_attributes A hash specifying the attributes for a event.
  def merge_in_events!(events_attributes)
    params_list = events_attributes.respond_to?(:each) ? events_attributes : [events_attributes]

    params_list.each do |event_params|
      events.build(event_params).upsert!
    end
  end

  private

  def validate_start_before_end
    return unless session_start > session_end
    errors.add(:session_start, :cannot_be_after_session_end)
  end

  # Sets the initial session start and end time
  def set_session_time
    time_now = Time.zone.now
    self.session_start ||= time_now
    self.session_end ||= time_now
  end
end
