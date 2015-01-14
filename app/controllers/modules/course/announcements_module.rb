class Course::AnnouncementsModule
  include Course::CoursesController::Module

  sidebar do
    [
      {
        title: I18n.t('course.announcements.sidebar_title'),
        unread: 0
      }
    ]
  end
end
