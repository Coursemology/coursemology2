# frozen_string_literal: true
class Course::LessonPlan::Event < ApplicationRecord
  acts_as_lesson_plan_item

  def initialize_duplicate(duplicator, other)
    copy_attributes(other, duplicator)
    self.course = duplicator.options[:target_course]
  end
end
