class Course::LessonPlanItem < ActiveRecord::Base
  actable
  stampable
  validates :base_exp, numericality: { only_integer: true }
  validates :time_bonus_exp, numericality: { only_integer: true }
  validates :extra_bonus_exp, numericality: { only_integer: true }
end
