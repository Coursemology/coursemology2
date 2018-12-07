# frozen_string_literal: true
class Course::PersonalTime < ApplicationRecord
  belongs_to :course_user, inverse_of: :personal_times
  belongs_to :lesson_plan_item, class_name: Course::LessonPlan::Item.name, inverse_of: :personal_times

  validates :start_at, presence: true
  validates :course_user, presence: true, uniqueness: { scope: :lesson_plan_item }
  validates :lesson_plan_item, presence: true
end
