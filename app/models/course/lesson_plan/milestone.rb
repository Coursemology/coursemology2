# frozen_string_literal: true
class Course::LessonPlan::Milestone < ApplicationRecord
  acts_as_lesson_plan_item has_todo: false

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    copy_attributes(other, duplicator)
  end

  # Used by the with_actable_types scope in Course::LessonPlan::Item.
  # Edit this to remove items for display.
  scope :ids_showable_in_lesson_plan, (lambda do |_|
    # joining { lesson_plan_item }.selecting { lesson_plan_item.id }
    unscoped.joins(:lesson_plan_item).select(Course::LessonPlan::Item.arel_table[:id])
  end)
end
