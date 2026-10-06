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
    unless (codaveri_settings_params.keys & ['model', 'system_prompt', 'override_system_prompt']).empty?
      authorize!(:manage_course_admin_settings, current_tenant)
    end

    if @settings.update(codaveri_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  def update_evaluator
    is_codaveri = update_evaluator_params[:programming_evaluator] == 'codaveri'
    @programming_questions = course_programming_questions(update_evaluator_params[:programming_question_ids])
    raise ActiveRecord::Rollback unless @programming_questions.update_all(is_codaveri: is_codaveri)
  end

  def update_live_feedback_enabled
    live_feedback_enabled = update_live_feedback_enabled_params[:live_feedback_enabled]
    @programming_questions =
      course_programming_questions(update_live_feedback_enabled_params[:programming_question_ids])
    raise ActiveRecord::Rollback unless @programming_questions.update_all(live_feedback_enabled: live_feedback_enabled)
  end

  private

  # The course's live programming questions among the given ids. The bulk updates above skip callbacks, so they
  # must be scoped here: otherwise ids from the request reach other courses' questions, and snapshots, which must
  # never change.
  #
  # @param [Array<String>] ids The requested programming question ids.
  # @return [ActiveRecord::Relation<Course::Assessment::Question::Programming>]
  def course_programming_questions(ids)
    programming = Course::Assessment::Question::Programming
    course_question_ids = Course::QuestionAssessment.
                          where(assessment_id: current_course.assessments.select(:id)).select(:question_id)
    course_programming_ids = Course::Assessment::Question.
                             where(id: course_question_ids, actable_type: programming.name).select(:actable_id)

    programming.live.where(id: ids).where(id: course_programming_ids)
  end

  def assessment_params
    params.permit(:id)
  end

  def codaveri_settings_params
    params.require(:settings_codaveri_component).permit(
      :feedback_workflow, :model, :system_prompt, :override_system_prompt, :live_feedback_enabled,
      :usage_limited_for_get_help, :max_get_help_user_messages
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
