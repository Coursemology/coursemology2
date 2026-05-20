# frozen_string_literal: true
class Course::GradebookComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    return [] unless can?(:read_gradebook, current_course)

    [
      {
        key: self.class.key,
        icon: :gradebook,
        type: :admin,
        weight: 4,
        path: course_gradebook_path(current_course)
      }
    ]
  end
end
