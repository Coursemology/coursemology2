class Course::AnnouncementsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  def settings
    @settings ||= Course::AnnouncementSettings.new(current_course.settings(:announcement))
  end

  private

  def main_sidebar_items
    [
      {
        key: :announcements,
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
        weight: 4,
        path: course_admin_announcements_path(current_course)
      }
    ]
  end

  def unread_count
    return 0 if current_course.nil? || current_user.nil?
    current_course.announcements.unread_by(current_user).count
  end
end
