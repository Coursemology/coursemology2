class Course::DuplicationComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    return [] unless current_user.administrator?
    [
      {
        key: :duplication,
        icon: 'clone',
        title: t('layouts.duplication.title'),
        type: :admin,
        weight: 4,
        path: course_duplication_path(current_course)
      }
    ]
  end
end
