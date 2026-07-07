# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponsesController < Course::Assessment::Question::Controller # rubocop:disable Metrics/ClassLength
  include Course::Assessment::Question::RubricBasedResponseControllerConcern
  include Course::Assessment::Question::GradingContextParamsConcern

  build_and_authorize_new_question :rubric_based_response_question,
                                   class: Course::Assessment::Question::RubricBasedResponse, only: [:new, :create]
  load_and_authorize_resource :rubric_based_response_question,
                              class: 'Course::Assessment::Question::RubricBasedResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]
  before_action :preload_criterions_per_category, only: [:edit]

  RESERVED_CATEGORY_NAMES = Course::Assessment::Question::RubricBasedResponse::RESERVED_CATEGORY_NAMES

  def create
    if @rubric_based_response_question.save
      success = add_bonus_category_to_rubric_based_question

      if success
        sync_active_rubric
        sync_grading_contexts(@rubric_based_response_question, grading_contexts_params)
        render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
      else
        head :bad_request
      end
    else
      render json: { errors: @rubric_based_response_question.errors.messages.values.flatten.to_sentence },
             status: :bad_request
    end
  end

  def edit
    @rubric_based_response_question.description = helpers.sanitize_ckeditor_rich_text(
      @rubric_based_response_question.description
    )

    @rubric_based_response_question.categories.without_bonus_category.each do |category|
      category.criterions.each do |grade|
        grade.explanation = helpers.sanitize_ckeditor_rich_text(grade.explanation)
      end
    end
  end

  def update
    case update_rubric_based_response_question
    when :needs_confirmation
      # The rubric changed incompatibly and there are graded answers: nothing was saved. The frontend
      # confirms with the user and re-submits the same update with confirm_rubric_advance: true.
      render json: { error: 'rubric_advance_confirmation_required' }, status: :conflict
    when :synced
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @rubric_based_response_question.errors.messages.values.flatten.to_sentence },
             status: :bad_request
    end
  end

  def destroy
    if @rubric_based_response_question.destroy
      super

      head :ok
    else
      error = @rubric_based_response_question.errors.messages.values.flatten.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  def add_bonus_category_to_rubric_based_question
    bonus_category_objects = RESERVED_CATEGORY_NAMES.map do |name|
      {
        question_id: @rubric_based_response_question.id,
        name: name.titleize,
        is_bonus_category: true
      }
    end

    ActiveRecord::Base.transaction do
      bonus_categories = Course::Assessment::Question::RubricBasedResponseCategory.insert_all(bonus_category_objects)
      if !bonus_categories.empty? && (bonus_categories.nil? || bonus_categories.rows.empty?)
        raise ActiveRecord::Rollback
      end

      true
    end
  end

  # Updates the v1 question and syncs the v2 active rubric. Returns :synced on success, :failed on a
  # validation error, or :needs_confirmation when an incompatible rubric change with graded answers needs
  # the user's confirmation -- in which case the entire transaction is rolled back (nothing is saved) so the
  # user can confirm on the still-open edit page and re-submit with confirm_rubric_advance: true.
  def update_rubric_based_response_question
    needs_confirmation = false
    saved = ActiveRecord::Base.transaction do
      raise ActiveRecord::Rollback unless apply_question_update

      if sync_active_rubric(confirm_advance: confirm_rubric_advance?) == :advance_required
        needs_confirmation = true
        raise ActiveRecord::Rollback
      end
      sync_grading_contexts(@rubric_based_response_question, grading_contexts_params)
      true
    end

    return :needs_confirmation if needs_confirmation

    saved ? :synced : :failed
  end

  # Updates the v1 question (skills + attributes) and re-clamps grades when the maximum changed. Returns
  # whether the question itself saved.
  def apply_question_update
    update_skill_ids_if_params_present(rubric_based_response_question_params[:question_assessment])
    previous_maximum_grade = @rubric_based_response_question.maximum_grade
    return false unless @rubric_based_response_question.update(
      rubric_based_response_question_params.except(:question_assessment)
    )

    clamp_answer_grades_to_maximum if @rubric_based_response_question.maximum_grade != previous_maximum_grade
    true
  end

  def confirm_rubric_advance?
    ActiveRecord::Type::Boolean.new.cast(params[:confirm_rubric_advance])
  end

  def rubric_based_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade,
      :ai_grading_enabled, :ai_grading_custom_prompt, :ai_grading_model_answer, :template_text,
      question_assessment: { skill_ids: [] },
      categories_attributes: [:_destroy, :id, :name,
                              criterions_attributes: [:_destroy, :id, :grade, :explanation]]
    ]

    params.require(:question_rubric_based_response).permit(*permitted_params)
  end

  # Grading contexts pulled into the rubric grading prompt (see GradingContext); replaced on every save.
  def grading_contexts_params
    params.require(:question_rubric_based_response).
      permit(grading_contexts: [:id, :context_type, :source_id, :identifier])[:grading_contexts]
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@rubric_based_response_question)
  end
end
