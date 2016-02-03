# frozen_string_literal: true
class Course::LessonPlan::Milestone < ActiveRecord::Base
  belongs_to :course, inverse_of: :lesson_plan_milestones
end
