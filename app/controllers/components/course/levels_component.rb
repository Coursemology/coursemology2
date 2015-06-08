class Course::LevelsComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: I18n.t('course.levels.sidebar_title'),
        path: course_levels_path(current_course)
      }
    ]
  end
end
