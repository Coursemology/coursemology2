# frozen_string_literal: true
class Course::Video::Session < ApplicationRecord
  validate :validate_start_before_end
  validates :session_start, presence: true
  validates :session_end, presence: true
  validates :last_video_time, numericality: { only_integer: true, greater_than_or_equal_to: -2_147_483_648,
                                              less_than: 2_147_483_648 }, allow_nil: true
  validates :submission, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  belongs_to :submission, inverse_of: :sessions
  has_many :events, -> { order(:sequence_num) }, inverse_of: :session, dependent: :destroy

  scope :with_events_present, -> { joins(:events).distinct }

  before_validation :set_session_time, if: :new_record?

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
