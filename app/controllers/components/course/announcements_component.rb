class Course::AnnouncementsComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :announcements,
        title: I18n.t('course.announcements.sidebar_title'),
        weight: 1,
        path: course_announcements_path(current_course),
        unread: unread_count
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: t('layouts.course_admin.announcement_settings.title'),
        type: :settings,
        controller: 'course/admin/announcement_settings',
        action: 'edit',
        weight: 4
      }
    ]
  end

  def unread_count
    return 0 if current_course.nil? || current_user.nil?
    current_course.announcements.unread_by(current_user).count
  end
end
