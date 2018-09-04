# frozen_string_literal: true
class Course::ReferenceTimeline < ApplicationRecord
  belongs_to :course, inverse_of: :reference_timelines
  has_many :reference_times,
           class_name: Course::ReferenceTime.name, inverse_of: :reference_timeline, dependent: :destroy
end
