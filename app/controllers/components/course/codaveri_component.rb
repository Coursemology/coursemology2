# frozen_string_literal: true
class Course::CodaveriComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    settings_sidebar_items
  end

  private

  def settings_sidebar_items
    [
      {
        key: self.class.key,
        type: :settings,
        weight: 6,
        path: course_admin_codaveri_path(current_course)
      }
    ]
  end
end
