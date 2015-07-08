class Course::GroupsComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
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
