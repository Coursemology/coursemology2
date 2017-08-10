# frozen_string_literal: true
class Course::Assessment::CategoriesController < Course::ComponentController
  load_and_authorize_resource :category,
                              through: :course,
                              through_association: :assessment_categories,
                              class: Course::Assessment::Category.name
  load_and_authorize_resource :tab,
                              through: :category,
                              class: Course::Assessment::Tab.name

  def index; end

  private

  # Define component to check if component is defined.
  # Assessments are used here since categories are part of the assessment component.
  #
  # @return [Course::AssessmentsComponent] The assessments component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
