# frozen_string_literal: true
class Course::DuplicationComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    return [] unless can?(:duplicate_from, current_course)

    [
      {
        key: :admin_duplication,
        icon: :duplication,
        type: :admin,
        weight: 5,
        path: course_duplication_path(current_course)
      }
    ]
  end
end
