# frozen_string_literal: true
class Course::Survey::Controller < Course::ComponentController
  load_and_authorize_resource :survey, through: :course, class: Course::Survey.name
  add_breadcrumb :index, :course_surveys_path

  private

  # Define survey component for the check whether the component is defined.
  #
  # @return [Course::SurveyComponent] The survey component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_survey_component]
  end

  def load_sections
    @sections ||=
      @survey.sections.accessible_by(current_ability).
      includes(questions: { options: { attachment_references: :attachment } })
  end
end
