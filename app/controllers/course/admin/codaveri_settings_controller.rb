# frozen_string_literal: true
class Course::Admin::CodaveriSettingsController < Course::Admin::Controller
  after_action :create_codaveri_problem, only: [:update_evaluator, :update_live_feedback_enabled]

  def edit
    load_course_assessments_data
  end

  def assessment
    id = assessment_params[:id]
    @assessment_with_programming_qns = current_course.assessments.includes(programming_questions: [:language]).find(id)
  end

  def update
    if @settings.update(codaveri_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  def update_evaluator
    is_codaveri = update_evaluator_params[:programming_evaluator] == 'codaveri'
    assessments = current_course.assessments.where(id: update_evaluator_params[:assessment_ids])
    question_ids = assessments.includes(:programming_questions).flat_map do |assessment|
      assessment.programming_questions.map(&:id)
    end
    @programming_questions = Course::Assessment::Question::Programming.where(id: question_ids)
    raise ActiveRecord::Rollback unless @programming_questions.update_all(is_codaveri: is_codaveri)
  end

  def update_live_feedback_enabled
    live_feedback_enabled = update_live_feedback_enabled_params[:live_feedback_enabled]
    assessments = current_course.assessments.where(id: update_live_feedback_enabled_params[:assessment_ids])
    question_ids = assessments.includes(:programming_questions).flat_map do |assessment|
      assessment.programming_questions.map(&:id)
    end
    @programming_questions = Course::Assessment::Question::Programming.where(id: question_ids)
    raise ActiveRecord::Rollback unless @programming_questions.update_all(live_feedback_enabled: live_feedback_enabled)
  end

  private

  def assessment_params
    params.permit(:id)
  end

  def codaveri_settings_params
    params.require(:settings_codaveri_component).permit(:is_only_itsp, :feedback_workflow, :live_feedback_enabled)
  end

  def update_evaluator_params
    params.require(:update_evaluator).permit(:programming_evaluator, assessment_ids: [])
  end

  def update_live_feedback_enabled_params
    params.require(:update_live_feedback_enabled).permit(:live_feedback_enabled, assessment_ids: [])
  end

  def component
    current_component_host[:course_codaveri_component]
  end

  def load_course_assessments_data
    @assessments_with_programming_qns = current_course.assessments.includes(:tab, programming_questions: [:language])
  end

  def create_codaveri_problem
    # Since update_all bypasses all rails callbacks, we invoke create_codaveri_problem here
    # to ensure codaveri problem is created
    @programming_questions.each(&:create_codaveri_problem)
  end
end
