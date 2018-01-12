# frozen_string_literal: true
class Course::Settings::SurveyComponent < Course::Settings::Component
  include Course::Settings::EmailSettingsConcern
  include Course::Settings::LessonPlanSettingsConcern

  def self.email_setting_items
    {
      survey_opening: { enabled_by_default: true },
      survey_closing: { enabled_by_default: true }
    }
  end

  def lesson_plan_item_settings
    super.merge(component_title: I18n.t('components.surveys.name'))
  end

  def self.component_class
    Course::SurveyComponent
  end
end
