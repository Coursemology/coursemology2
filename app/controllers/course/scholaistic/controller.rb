# frozen_string_literal: true
class Course::Scholaistic::Controller < Course::ComponentController
  include Course::Scholaistic::Concern

  before_action :not_found_if_scholaistic_course_not_linked

  private

  def component
    current_component_host[:course_scholaistic_component]
  end

  def not_found_if_scholaistic_course_not_linked
    head :not_found unless scholaistic_course_linked?
  end
end
