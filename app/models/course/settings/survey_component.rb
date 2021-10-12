# frozen_string_literal: true
class Course::Settings::SurveyComponent < Course::Settings::Component
  include Course::Settings::LessonPlanSettingsConcern

  def lesson_plan_item_settings
    super.merge(component_title: I18n.t('components.surveys.name'))
  end

  def showable_in_lesson_plan?
    settings.lesson_plan_items ? settings.lesson_plan_items['enabled'] : true
  end

  def self.component_class
    Course::SurveyComponent
  end
end
