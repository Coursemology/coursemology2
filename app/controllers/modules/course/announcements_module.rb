class Course::AnnouncementsModule
  include Course::ModuleHost::Module

  sidebar do
    [
      {
        title: I18n.t('course.announcements.sidebar_title'),
        unread: Course::AnnouncementsModule.unread_count(@course, current_user)

      }
    ]
  end

  def self.unread_count(course, user)
    return 0 if course.nil? || user.nil?
    course.announcements.unread_by(user).count
  end
end
