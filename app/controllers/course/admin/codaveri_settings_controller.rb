# frozen_string_literal: true
class Course::Admin::CodaveriSettingsController < Course::Admin::Controller
  def edit
    load_course_assessments_data
  end

  def update
    if @settings.update(codaveri_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  def update_evaluator
    is_codaveri = update_evaluator_params == 'codaveri'
    question_ids = current_course.assessments.includes(:programming_questions).flat_map do |assessment|
      assessment.programming_questions.map(&:id)
    end
    programming_questions = Course::Assessment::Question::Programming.where(id: question_ids)
    raise ActiveRecord::Rollback unless programming_questions.update_all(is_codaveri: is_codaveri)
  end

  private

  def codaveri_settings_params
    params.require(:settings_codaveri_component).permit(:is_only_itsp, :feedback_workflow)
  end

  def update_evaluator_params
    params.require(:programming_evaluator)
  end

  def component
    current_component_host[:course_codaveri_component]
  end

  def load_course_assessments_data
    @assessments_with_programming_qns = current_course.assessments.includes(programming_questions: [:language])
  end
end
