class Course::AchievementsModule
  include Course::ModuleHost::Module

  sidebar do
    [
      {
        title: I18n.t('course.achievements.sidebar_title'),
        unread: 0
      }
    ]
  end
end
