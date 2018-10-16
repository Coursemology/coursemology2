# frozen_string_literal: true
class Course::ReferenceTimeline < ApplicationRecord
  belongs_to :course, inverse_of: :reference_timelines
  has_many :reference_times,
           class_name: Course::ReferenceTime.name, inverse_of: :reference_timeline, dependent: :destroy
  has_many :course_users, foreign_key: :reference_timeline_id, inverse_of: :reference_timeline,
                          dependent: :restrict_with_error

  validates :default, inclusion: { in: [true, false] }
  validates :course, presence: true

  def initialize_duplicate(duplicator, _other)
    self.course = duplicator.options[:destination_course]
    self.reference_times = []
  end
end
