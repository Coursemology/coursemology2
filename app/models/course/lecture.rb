# frozen_string_literal: true
class Course::Lecture < ActiveRecord::Base
  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  belongs_to :course, inverse_of: :lectures

  scope :sorted_by_date, -> { order(start_at: :desc) }
end
