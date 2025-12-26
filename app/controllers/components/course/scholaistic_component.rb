# frozen_string_literal: true
class Course::ScholaisticComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::Scholaistic::Concern

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    return [] unless scholaistic_course_linked?

    student_sidebar_items + admin_sidebar_items
  end

  def student_sidebar_items
    [
      {
        key: :scholaistic_assessments,
        icon: :chatbot,
        title: settings.assessments_title,
        weight: 4,
        path: course_scholaistic_assessments_path(current_course)
      }
    ] + assistant_sidebar_items
  end

  def assistant_sidebar_items
    ScholaisticApiService.assistants!(current_course).map do |assistant|
      {
        key: "scholaistic_assistant_#{assistant[:id]}",
        icon: :chatbot,
        title: assistant[:sidebar_title] || assistant[:title],
        weight: 4.5,
        path: course_scholaistic_assistant_path(current_course, assistant[:id])
      }
    end
  rescue StandardError => e
    Rails.logger.error("Failed to load Scholaistic assistants: #{e.message}")
    raise e unless Rails.env.production?

    []
  end

  def admin_sidebar_items
    return [] unless can?(:manage_scholaistic_assistants, current_course)

    [
      {
        key: :admin_scholaistic_assistants,
        type: :admin,
        icon: :chatbot,
        weight: 9,
        path: course_scholaistic_assistants_path(current_course),
        exact: true
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        type: :settings,
        key: self.class.key,
        weight: 5,
        path: course_admin_scholaistic_path(current_course)
      }
    ]
  end
end
