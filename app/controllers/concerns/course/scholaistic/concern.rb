# frozen_string_literal: true
module Course::Scholaistic::Concern
  extend ActiveSupport::Concern

  private

  def scholaistic_course_linked?
    current_course.component_enabled?(Course::ScholaisticComponent) &&
      current_course.settings(:course_scholaistic_component)&.integration_key.present?
  end
end
