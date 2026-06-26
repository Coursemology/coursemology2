# frozen_string_literal: true
class Course::ExternalAssessmentsController < Course::ComponentController
  before_action :load_external_assessment, only: [:update, :destroy, :grades]

  def create
    authorize! :manage_gradebook_weights, current_course
    @weighted_view_enabled = gradebook_settings.weighted_view_enabled
    @external_assessment = Course::ExternalAssessment.create_for_course!(
      course: current_course,
      title: create_params[:title],
      maximum_grade: create_params[:maximumGrade],
      weight: create_weight,
      floor_at_zero: bound_flag(:floorAtZero, default: true),
      cap_at_maximum: bound_flag(:capAtMaximum, default: true)
    )
    render 'create'
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: { base: e.message } }, status: :unprocessable_entity
  end

  def update
    authorize! :manage_gradebook_weights, current_course
    @weighted_view_enabled = gradebook_settings.weighted_view_enabled
    @external_assessment.update!(update_params_attrs)
    update_weight if @weighted_view_enabled && params.key?(:weight)
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

  def gradebook_settings
    @gradebook_settings ||= Course::Settings::GradebookComponent.new(component)
  end

  def load_external_assessment
    @external_assessment = Course::ExternalAssessment.for_course(current_course).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  def create_params
    params.permit(:title, :maximumGrade, :weight, :floorAtZero, :capAtMaximum)
  end

  def create_weight
    @weighted_view_enabled ? (create_params[:weight].presence || 0).to_f : 0
  end

  def update_weight
    @external_assessment.gradebook_contribution&.update!(weight: (params[:weight].presence || 0).to_f)
  end

  def update_params_attrs
    attrs = {}
    attrs[:title] = params[:title] if params.key?(:title)
    attrs[:maximum_grade] = params[:maximumGrade] if params.key?(:maximumGrade)
    attrs[:floor_at_zero] = bound_flag(:floorAtZero, default: true) if params.key?(:floorAtZero)
    attrs[:cap_at_maximum] = bound_flag(:capAtMaximum, default: true) if params.key?(:capAtMaximum)
    attrs
  end

  # Coerce a string/bool HTTP param into a Ruby boolean (defaults when absent).
  def bound_flag(key, default:)
    return default unless params.key?(key)

    ActiveRecord::Type::Boolean.new.cast(params[key])
  end

  def grade_params
    params.permit(:studentId, :grade)
  end

  # Blank cell clears the grade to null (ungraded), never zero (decision #7).
  def normalized_grade(value)
    value.blank? ? nil : value
  end
end
