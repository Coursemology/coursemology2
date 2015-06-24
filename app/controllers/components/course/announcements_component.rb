class Course::AnnouncementsComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: I18n.t('course.announcements.sidebar_title'),
        path: course_announcements_path(current_course),
        unread: Course::AnnouncementsComponent.unread_count(current_course, current_user)
      }
    ]
  end

  settings do
    [
      {
        title: t('layouts.course_admin.announcement_settings.title'),
        controller: 'course/admin/announcement_settings',
        action: 'edit'
      }
    ]
  end

  def self.unread_count(course, user)
    return 0 if course.nil? || user.nil?
    course.announcements.unread_by(user).count
  end
end
