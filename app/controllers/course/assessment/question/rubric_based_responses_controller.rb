# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponsesController < Course::Assessment::Question::Controller
  include Course::Assessment::Question::GradingContextParamsConcern
  include Course::Assessment::Question::RubricAuthoringConcern

  build_and_authorize_new_question :rubric_based_response_question,
                                   class: Course::Assessment::Question::RubricBasedResponse, only: [:new, :create]
  load_and_authorize_resource :rubric_based_response_question,
                              class: 'Course::Assessment::Question::RubricBasedResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]
  # DEPRECATED safety net (remove with Course::Rubric.build_from_v1): gives a legacy question still lacking a
  # v2 rubric one built from its v1 rows, so its edit page shows (and re-saves) its existing rubric.
  before_action :ensure_active_rubric_from_v1, only: [:edit, :update]

  def create
    saved = ActiveRecord::Base.transaction do
      assign_active_rubric_from_params
      raise ActiveRecord::Rollback unless @rubric_based_response_question.save

      link_active_rubric
      sync_grading_contexts(@rubric_based_response_question, grading_contexts_params)
      true
    end

    if saved
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @rubric_based_response_question.errors.messages.values.flatten.to_sentence },
             status: :bad_request
    end
  end

  def edit
    @rubric_based_response_question.description = helpers.sanitize_ckeditor_rich_text(
      @rubric_based_response_question.description
    )
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

  def rubric_question
    @rubric_based_response_question
  end

  # Updates the question and its v2 active rubric (built from the params, copy-on-write). Returns :synced on
  # success, :failed on a validation error, or :needs_confirmation when an incompatible rubric change with
  # graded answers needs the user's confirmation -- in which case the entire transaction is rolled back
  # (nothing is saved) so the user can confirm on the still-open edit page and re-submit with
  # confirm_rubric_advance: true.
  def update_rubric_based_response_question
    needs_confirmation = false
    saved = ActiveRecord::Base.transaction do
      previous_active = @rubric_based_response_question.active_rubric
      raise ActiveRecord::Rollback unless apply_question_update

      if sync_rubric_advance(previous_active, @rubric_based_response_question.active_rubric) == :advance_required
        needs_confirmation = true
        raise ActiveRecord::Rollback
      end
      sync_grading_contexts(@rubric_based_response_question, grading_contexts_params)
      true
    end

    return :needs_confirmation if needs_confirmation

    saved ? :synced : :failed
  end

  # Updates the question (skills, attributes and active rubric) and re-clamps answer grades when the maximum
  # grade changed. Returns whether the question saved.
  def apply_question_update
    update_skill_ids_if_params_present(rubric_based_response_question_params[:question_assessment])
    previous_maximum_grade = @rubric_based_response_question.maximum_grade
    assign_active_rubric_from_params
    updated = @rubric_based_response_question.update(
      rubric_based_response_question_params.except(:question_assessment)
    )

    if updated && @rubric_based_response_question.maximum_grade != previous_maximum_grade
      @rubric_based_response_question.acting_as.clamp_answer_grades_to_maximum!
    end
    updated
  end

  # Attributes assigned directly to the question. The rubric is built separately from #rubric_params.
  def rubric_based_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade, :ai_grading_enabled, :template_text,
      question_assessment: { skill_ids: [] }
    ]

    params.require(:question_rubric_based_response).permit(*permitted_params)
  end

  # The rubric configuration, used to build the v2 active rubric (see RubricAuthoringConcern).
  def rubric_params
    params.require(:question_rubric_based_response).permit(
      :ai_grading_custom_prompt, :ai_grading_model_answer,
      categories_attributes: [:id, :name, :_destroy,
                              criterions_attributes: [:id, :grade, :explanation, :_destroy]]
    )
  end

  # Grading contexts pulled into the rubric grading prompt (see GradingContext); replaced on every save.
  def grading_contexts_params
    params.require(:question_rubric_based_response).
      permit(grading_contexts: [:id, :context_type, :source_id, :identifier])[:grading_contexts]
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@rubric_based_response_question)
  end

  def ensure_active_rubric_from_v1
    @rubric_based_response_question.ensure_active_rubric_from_v1!(current_course)
  end
end
