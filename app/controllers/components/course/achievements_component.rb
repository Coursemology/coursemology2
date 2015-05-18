class Course::AchievementsComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: I18n.t('course.achievements.sidebar_title'),
        unread: 0
      }
    ]
  end
end
