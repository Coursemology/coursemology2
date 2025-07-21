# frozen_string_literal: true
class Course::Plagiarism::Controller < Course::ComponentController
  before_action :authorize_manage_plagiarism!

  private

  def authorize_manage_plagiarism!
    authorize!(:manage_plagiarism, current_course)
  end

  # @return [Course::PlagiarismComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_plagiarism_component]
  end
end
