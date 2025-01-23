# frozen_string_literal: true
class Course::RagWiseComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.rag_wise.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    settings_sidebar_items
  end

  private

  def settings_sidebar_items
    [
      {
        title: t('layouts.course_admin.rag_wise.title'),
        type: :settings,
        weight: 6,
        path: course_admin_rag_wise_path(current_course)
      }
    ]
  end
end
