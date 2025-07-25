# frozen_string_literal: true
class Course::ScholaisticComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.scholaistic.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :scholaistic_assessments,
        icon: :chatbot,
        title: settings.assessments_title || I18n.t('course.scholaistic.assessments'),
        weight: 4,
        path: course_scholaistic_assessments_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        type: :settings,
        title: I18n.t('components.scholaistic.name'),
        weight: 5,
        path: course_admin_scholaistic_path(current_course)
      }
    ]
  end
end
