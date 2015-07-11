class Course::LessonPlanMilestone < ActiveRecord::Base
  belongs_to :course, inverse_of: :lesson_plan_milestones
end
