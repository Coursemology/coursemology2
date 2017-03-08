# frozen_string_literal: true
class Course::LessonPlan::Event < ActiveRecord::Base
  acts_as_lesson_plan_item

  enum event_type: { other: 0, virtual_classroom: 1, recitation: 2, tutorial: 3 }
  def initialize_duplicate(duplicator, other)
    self.course = duplicator.duplicate(other.course)
    copy_attributes(other, duplicator.time_shift)
  end
end
