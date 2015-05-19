class Course::AnnouncementsComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: I18n.t('course.announcements.sidebar_title'),
        unread: Course::AnnouncementsComponent.unread_count(current_course, current_user)

      }
    ]
  end

  def self.unread_count(course, user)
    return 0 if course.nil? || user.nil?
    course.announcements.unread_by(user).count
  end
end
