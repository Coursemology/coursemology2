# frozen_string_literal: true
class Course::SurveyComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.lesson_plan_item_actable_names
    [Course::Survey.name]
  end

  def sidebar_items
    [
      {
        key: :surveys,
        icon: :survey,
        weight: 11,
        path: course_surveys_path(current_course)
      }
    ]
  end
end
