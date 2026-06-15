# frozen_string_literal: true
class Course::ExternalAssessmentsController < Course::ComponentController
  before_action :load_external_assessment, only: [:update, :destroy, :grades]

  def create
    authorize! :manage_gradebook_weights, current_course
    @external_assessment = Course::ExternalAssessment.create_for_course!(
      course: current_course,
      title: create_params[:title],
      maximum_grade: create_params[:maximumGrade]
    )
    render 'create'
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: { base: e.message } }, status: :unprocessable_entity
  end

  def update
    authorize! :manage_gradebook_weights, current_course
    @external_assessment.update!(update_params_attrs)
    render 'update'
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: { base: e.message } }, status: :unprocessable_entity
  end

  def destroy
    authorize! :manage_gradebook_weights, current_course
    @external_assessment.destroy!
    head :ok
  end

  def grades
    authorize! :grade, @external_assessment
    course_user = current_course.course_users.find(grade_params[:courseUserId])
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

  def create_params
    params.permit(:title, :maximumGrade)
  end

  def update_params_attrs
    attrs = {}
    attrs[:title] = params[:title] if params.key?(:title)
    attrs[:maximum_grade] = params[:maximumGrade] if params.key?(:maximumGrade)
    attrs
  end

  def grade_params
    params.permit(:courseUserId, :grade)
  end

  # Blank cell clears the grade to null (ungraded), never zero (decision #7).
  def normalized_grade(value)
    value.blank? ? nil : value
  end
end
