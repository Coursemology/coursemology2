# frozen_string_literal: true
class Course::Scholaistic::Controller < Course::ComponentController
  private

  def component
    current_component_host[:course_scholaistic_component]
  end
end
