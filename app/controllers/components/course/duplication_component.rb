class Course::DuplicationComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.duplication.name')
  end

  def sidebar_items
    return [] unless can?(:duplicate, current_course)
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
