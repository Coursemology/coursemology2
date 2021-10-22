# frozen_string_literal: true
class Course::LearningMapController < Course::ComponentController
  add_breadcrumb :index, :course_learning_map_path

  def index
  end

  private

  # @return [Course::LearningMapComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_learning_map_component]
  end
end
