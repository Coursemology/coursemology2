# frozen_string_literal: true
class Course::ScholaisticComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::Scholaistic::Concern

  def self.display_name
    I18n.t('components.scholaistic.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    settings_sidebar_items
  end

  private

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
