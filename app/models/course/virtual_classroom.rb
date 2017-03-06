# frozen_string_literal: true
class Course::VirtualClassroom < ActiveRecord::Base
  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  belongs_to :course, inverse_of: :virtual_classrooms

  scope :sorted_by_date, -> { order(start_at: :desc) }
end
