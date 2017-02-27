# frozen_string_literal: true
class Course::LecturesComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.lectures.name')
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  def self.enabled_by_default?
    false
  end

  def settings
    @settings ||= Course::LectureSettings.new(current_course.settings(:lecture))
  end

  private

  def main_sidebar_items
    [
      {
        key: :lectures,
        icon: 'television',
        title: settings.title || t('course.lectures.sidebar_title'),
        weight: 1,
        path: course_lectures_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: settings.title || t('layouts.course_admin.lecture_settings.title'),
        type: :settings,
        weight: 3,
        path: course_admin_lectures_path(current_course)
      }
    ]
  end
end