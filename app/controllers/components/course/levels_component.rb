class Course::LevelsComponent < SimpleDelegator
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        key: :levels,
        title: I18n.t('course.levels.sidebar_title'),
        type: :admin,
        weight: 2,
        path: course_levels_path(current_course)
      }
    ]
  end
end
