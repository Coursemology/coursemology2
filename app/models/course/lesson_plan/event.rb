# frozen_string_literal: true
class Course::LessonPlan::Event < ActiveRecord::Base
  acts_as_lesson_plan_item

  def initialize_duplicate(duplicator, other)
    copy_attributes(other, duplicator)

    if duplicator.mode == :course
      self.course = duplicator.duplicate(other.course)
    elsif duplicator.mode == :object
      self.course = duplicator.options[:target_course]
    end
  end
end
