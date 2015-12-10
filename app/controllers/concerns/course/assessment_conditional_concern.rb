module Course::AssessmentConditionalConcern
  extend ActiveSupport::Concern

  included do
    before_action :add_conditional_breadcrumbs
  end

  def return_to_path
    edit_course_assessment_path(current_course, @conditional)
  end

  def set_conditional
    @conditional = Course::Assessment.find(conditional_params[:assessment_id])
  end

  private

  def add_conditional_breadcrumbs
    add_breadcrumb :index, :course_assessments_path
    add_breadcrumb @conditional.title, edit_course_assessment_path(current_course, @conditional)
  end

  def conditional_params
    params.permit(:assessment_id)
  end
end
