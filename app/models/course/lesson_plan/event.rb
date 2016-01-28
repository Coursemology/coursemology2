# frozen_string_literal: true
class Course::LessonPlan::Event < ActiveRecord::Base
  acts_as_lesson_plan_item

  enum event_type: { other: 0, lecture: 1, recitation: 2, tutorial: 3 }
end
