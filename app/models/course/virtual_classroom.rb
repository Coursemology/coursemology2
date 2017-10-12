# frozen_string_literal: true
class Course::VirtualClassroom < ApplicationRecord
  attr_writer :duration
  before_validation :convert_duration_to_end_at
  acts_as_readable on: :updated_at
  has_many_attachments on: :content
  belongs_to :instructor, class_name: 'User', foreign_key: :instructor_id, inverse_of: nil

  belongs_to :course, inverse_of: :virtual_classrooms

  scope :sorted_by_date, -> { order(start_at: :desc) }

  def duration
    return nil unless start_at && end_at
    @duration ||= ((end_at - start_at) / 60).to_i
  end

  def recorded_videos_error?
    recorded_videos_fetched? && !recorded_videos.empty? && recorded_videos[0]['status'] == 'error'
  end

  def recorded_videos_exist?
    recorded_videos_fetched? && !recorded_videos_error? && !recorded_videos.empty?
  end

  def recorded_videos_fetched?
    recorded_videos != nil
  end

  private

  def convert_duration_to_end_at
    self.end_at = start_at + @duration.to_i.minutes if start_at && @duration
  end
end
