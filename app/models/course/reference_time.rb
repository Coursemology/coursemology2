# frozen_string_literal: true
class Course::ReferenceTime < ApplicationRecord
  belongs_to :reference_timeline, class_name: Course::ReferenceTimeline.name, inverse_of: :reference_times
  belongs_to :lesson_plan_item, class_name: Course::LessonPlan::Item.name, inverse_of: :reference_times
end
