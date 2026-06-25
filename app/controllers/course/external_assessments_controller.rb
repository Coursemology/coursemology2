# frozen_string_literal: true
class Course::ExternalAssessmentsController < Course::ComponentController
  before_action :load_external_assessment, only: [:grades]

  def grades
    authorize! :grade, @external_assessment
    # The gradebook keys students by user_id (see index/update_grade jbuilders), so the
    # `studentId` param is a user_id, not a course_user PK.
    course_user = current_course.course_users.find_by!(user_id: grade_params[:studentId])
    @grade = @external_assessment.external_assessment_grades.
             find_or_initialize_by(course_user: course_user)
    @grade.grade = normalized_grade(grade_params[:grade])
    @grade.save!
    render 'update_grade'
  rescue ActiveRecord::RecordNotUnique
    retry
  rescue ActiveRecord::RecordNotFound
    head :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: { base: e.message } }, status: :unprocessable_entity
  end

  private

  def component
    current_component_host[:course_gradebook_component]
  end

  def load_external_assessment
    @external_assessment = Course::ExternalAssessment.for_course(current_course).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  def grade_params
    params.permit(:studentId, :grade)
  end

  # Blank cell clears the grade to null (ungraded), never zero (decision #7).
  def normalized_grade(value)
    value.blank? ? nil : value
  end
end
