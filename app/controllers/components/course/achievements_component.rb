class Course::AchievementsComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: I18n.t('course.achievements.sidebar_title'),
        weight: 2,
        path: course_achievements_path(current_course),
        unread: 0
      }
    ]
  end
end
