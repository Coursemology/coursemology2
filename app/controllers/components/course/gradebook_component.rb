# frozen_string_literal: true
class Course::GradebookComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    'Gradebook'
  end

  def sidebar_items
    return [] unless can?(:read_gradebook, current_course)

    [
      {
        key: self.class.key,
        icon: :gradebook,
        title: I18n.t('course.gradebook.component.sidebar_title'),
        type: :admin,
        weight: 4,
        path: course_gradebook_path(current_course)
      }
    ]
  end
end
