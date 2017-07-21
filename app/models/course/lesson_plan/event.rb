# frozen_string_literal: true
class Course::LessonPlan::Event < ActiveRecord::Base
  acts_as_lesson_plan_item

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.duplicate(other.course)
    copy_attributes(other, duplicator.time_shift)
  end
end
