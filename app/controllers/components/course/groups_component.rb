class Course::GroupsComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        key: :groups,
        title: I18n.t('course.groups.sidebar_title'),
        type: :admin,
        weight: 3,
        path: course_groups_path(current_course)
      }
    ]
  end
end
