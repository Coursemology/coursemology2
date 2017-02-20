# frozen_string_literal: true
class Course::SurveyComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.surveys.name')
  end

  def sidebar_items
    [
      {
        key: :surveys,
        icon: 'pie-chart',
        title: I18n.t('course.surveys.sidebar_title'),
        weight: 11,
        path: course_surveys_path(current_course)
      }
    ]
  end
end
