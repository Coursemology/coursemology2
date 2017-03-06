# frozen_string_literal: true
class Course::VirtualClassroom < ActiveRecord::Base
  attr_writer :duration
  before_validation :convert_duration_to_end_at
  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  belongs_to :course, inverse_of: :virtual_classrooms

  scope :sorted_by_date, -> { order(start_at: :desc) }

  def duration
    return nil unless start_at && end_at
    @duration ||= ((end_at - start_at) / 60).to_i
  end

  private

  def convert_duration_to_end_at
    self.end_at = start_at + @duration.to_i.minutes if start_at && @duration
  end
end
