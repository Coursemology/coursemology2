# frozen_string_literal: true
class DuplicationTraceable::LessonPlanItem < ApplicationRecord
  acts_as_duplication_traceable

  validates :lesson_plan_item, presence: true
  belongs_to :lesson_plan_item, class_name: Course::LessonPlan::Item.name, inverse_of: :duplication_traceable

  # Class that the duplication traceable depends on.
  def self.dependent_class
    Course::LessonPlan::Item.name
  end

  def self.initialize_with_dest(dest, **options)
    new(lesson_plan_item: dest, **options)
  end
end
