# frozen_string_literal: true
class Course::LessonPlan::Milestone < ApplicationRecord
  belongs_to :course, inverse_of: :lesson_plan_milestones

  def initialize_duplicate(duplicator, _other)
    self.start_at = duplicator.time_shift(start_at)
    self.course = duplicator.options[:target_course]
  end
end
