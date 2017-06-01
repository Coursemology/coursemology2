# frozen_string_literal: true
class Course::AnnouncementsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.announcements.name')
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :announcements,
        icon: 'bullhorn',
        title: settings.title || t('course.announcements.sidebar_title'),
        weight: 1,
        path: course_announcements_path(current_course),
        unread: unread_count
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: settings.title || t('layouts.course_admin.announcement_settings.title'),
        type: :settings,
        weight: 3,
        path: course_admin_announcements_path(current_course)
      }
    ]
  end

  def unread_count
    current_course.announcements.unread_by(current_user).count
  end
end
