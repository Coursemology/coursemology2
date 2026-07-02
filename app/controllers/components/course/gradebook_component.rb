# frozen_string_literal: true
class Course::GradebookComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    'Gradebook'
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    return [] unless can?(:read_gradebook, current_course)

    [
      {
        key: self.class.key,
        icon: :gradebook,
        type: :normal,
        weight: 9,
        path: course_gradebook_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    return [] unless can?(:manage_gradebook_settings, current_course)

    [
      {
        key: self.class.key,
        type: :settings,
        weight: 14,
        path: course_admin_gradebook_path(current_course)
      }
    ]
  end
end
