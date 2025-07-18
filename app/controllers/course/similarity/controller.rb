# frozen_string_literal: true
class Course::Similarity::Controller < Course::ComponentController
  before_action :authorize_manage_similarity!

  private

  def authorize_manage_similarity!
    authorize!(:manage_similarity, current_course)
  end

  # @return [Course::SimilarityComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_similarity_component]
  end
end
