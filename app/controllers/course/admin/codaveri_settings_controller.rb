# frozen_string_literal: true
class Course::Admin::CodaveriSettingsController < Course::Admin::Controller
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
    @programming_questions = Course::Assessment::Question::Programming.
                             where(id: update_evaluator_params[:programming_question_ids])
    raise ActiveRecord::Rollback unless @programming_questions.update_all(is_codaveri: is_codaveri)
  end

  def update_live_feedback_enabled
    live_feedback_enabled = update_live_feedback_enabled_params[:live_feedback_enabled]
    @programming_questions = Course::Assessment::Question::Programming.
                             where(id: update_live_feedback_enabled_params[:programming_question_ids])
    raise ActiveRecord::Rollback unless @programming_questions.update_all(live_feedback_enabled: live_feedback_enabled)
  end

  private

  def assessment_params
    params.permit(:id)
  end

  def codaveri_settings_params
    params.require(:settings_codaveri_component).permit(
      :feedback_workflow, :model, :system_prompt, :live_feedback_enabled
    )
  end

  def update_evaluator_params
    params.require(:update_evaluator).permit(:programming_evaluator, programming_question_ids: [])
  end

  def update_live_feedback_enabled_params
    params.require(:update_live_feedback_enabled).permit(:live_feedback_enabled, programming_question_ids: [])
  end

  def component
    current_component_host[:course_codaveri_component]
  end

  def load_course_assessments_data
    @assessments_with_programming_qns = current_course.assessments.includes(:tab, programming_questions: [:language])
  end
end
