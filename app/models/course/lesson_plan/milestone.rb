# frozen_string_literal: true
class Course::LessonPlan::Milestone < ActiveRecord::Base
  belongs_to :course, inverse_of: :lesson_plan_milestones

  def initialize_duplicate(duplicator, other)
    self.start_at = duplicator.time_shift(start_at)

    if duplicator.mode == :course
      self.course = duplicator.duplicate(other.course)
    elsif duplicator.mode == :object
      self.course = duplicator.options[:target_course]
    end
  end
end
