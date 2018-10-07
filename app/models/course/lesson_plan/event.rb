# frozen_string_literal: true
class Course::LessonPlan::Event < ApplicationRecord
  acts_as_lesson_plan_item

  validates_length_of :location, allow_nil: true, maximum: 255
  validates_length_of :event_type, allow_nil: true, maximum: 255
  validates_presence_of :event_type

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    copy_attributes(other, duplicator)
  end

  # Used by the with_actable_types scope in Course::LessonPlan::Item.
  # Edit this to remove items for display.
  scope :ids_showable_in_lesson_plan, (lambda do |_|
    joining { lesson_plan_item }.selecting { lesson_plan_item.id }
  end)
end
