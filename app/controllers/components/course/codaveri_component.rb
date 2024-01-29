# frozen_string_literal: true
class Course::CodaveriComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.codaveri.name')
  end

  def sidebar_items
    settings_sidebar_items
  end

  private

  def settings_sidebar_items
    [
      {
        title: t('layouts.course_admin.codaveri.title'),
        type: :settings,
        weight: 6,
        path: course_admin_codaveri_path(current_course)
      }
    ]
  end
end
