# frozen_string_literal: true
class Course::LessonPlan::Event < ApplicationRecord
  acts_as_lesson_plan_item

  def initialize_duplicate(duplicator, other)
    copy_attributes(other, duplicator)
    self.course = duplicator.options[:destination_course]
  end

  # Used by the with_actable_types scope in Course::LessonPlan::Item.
  # Edit this to remove items for display.
  scope :ids_showable_in_lesson_plan, (lambda do |_|
    joining { lesson_plan_item }.selecting { lesson_plan_item.id }
  end)
end
