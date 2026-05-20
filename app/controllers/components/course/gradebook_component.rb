# frozen_string_literal: true
class Course::GradebookComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    'Gradebook'
  end

  def sidebar_items
    items = []

    if can?(:read_gradebook, current_course)
      items << {
        key: self.class.key,
        icon: :gradebook,
        title: I18n.t('course.gradebook.component.sidebar_title'),
        type: :normal,
        weight: 9,
        path: course_gradebook_path(current_course)
      }
    end

    if can?(:manage_gradebook_settings, current_course)
      items << {
        key: self.class.key,
        title: I18n.t('course.gradebook.component.sidebar_title'),
        type: :settings,
        weight: 9,
        path: course_admin_gradebook_path(current_course)
      }
    end

    items
  end
end
