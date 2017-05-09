# frozen_string_literal: true
class Course::LessonPlan::Controller < Course::ComponentController
  add_breadcrumb :index, :course_lesson_plan_path

  private

  # Define lesson plan component for the check whether the component is defined.
  #
  # @return [Course::LessonPlanComponent] The lesson plan component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_lesson_plan_component]
  end
end
