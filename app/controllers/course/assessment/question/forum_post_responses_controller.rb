# frozen_string_literal: true
class Course::Assessment::Question::ForumPostResponsesController < Course::Assessment::Question::Controller # rubocop:disable Metrics/ClassLength
  include Course::Assessment::Question::GradingContextParamsConcern

  build_and_authorize_new_question :forum_post_response_question,
                                   class: Course::Assessment::Question::ForumPostResponse, only: [:new, :create]
  load_and_authorize_resource :forum_post_response_question,
                              class: 'Course::Assessment::Question::ForumPostResponse',
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

  def create
    saved = ActiveRecord::Base.transaction do
      if rubric_grading_mode_param?
        synced = assign_active_rubric_from_params
        # The maximum grade of a rubric-graded question is defined by its rubric, not the (disabled, possibly
        # stale) client field -- derive it so the two can never disagree.
        @forum_post_response_question.maximum_grade = rubric_maximum_grade(synced)
      end
      raise ActiveRecord::Rollback unless @forum_post_response_question.save

      link_active_rubric if rubric_grading_mode_param?
      sync_grading_contexts(@forum_post_response_question, grading_contexts_params)
      true
    end

    if saved
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @forum_post_response_question.errors }, status: :bad_request
    end
  end

  def edit
    @forum_post_response_question.description =
      helpers.sanitize_ckeditor_rich_text(
        @forum_post_response_question.description
      )
  end

  def update
    update_skill_ids_if_params_present(forum_post_response_question_params[:question_assessment])

    case update_forum_post_response_question
    when :needs_confirmation
      # The rubric changed incompatibly and there are graded answers: nothing was saved. The frontend
      # confirms with the user and re-submits the same update with confirm_rubric_advance: true.
      render json: { error: 'rubric_advance_confirmation_required' }, status: :conflict
    when :synced
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @forum_post_response_question.errors }, status: :bad_request
    end
  end

  def destroy
    if @forum_post_response_question.destroy
      super

      head :ok
    else
      error = @forum_post_response_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  # Updates the question and, when in rubric grading mode, syncs its v2 active_rubric from the edit-page
  # params (copy-on-write). Returns :synced on success, :failed on a validation error, or :needs_confirmation
  # when an incompatible rubric change with graded answers needs confirmation -- in which case the whole
  # transaction is rolled back so the user can confirm and re-submit with confirm_rubric_advance: true.
  def update_forum_post_response_question
    needs_confirmation = false
    saved = ActiveRecord::Base.transaction do
      previous_active = @forum_post_response_question.active_rubric
      # Switching to default grading mode retains the active_rubric (dormant, ignored by auto_gradable?) so the
      # configured rubric survives a round-trip back to rubric mode; only rubric mode (re)syncs it.
      synced = assign_active_rubric_from_params if rubric_grading_mode_param?

      raise ActiveRecord::Rollback unless @forum_post_response_question.update(forum_question_attributes(synced))

      if rubric_grading_mode_param? && sync_rubric_advance(previous_active, synced) == :advance_required
        needs_confirmation = true
        raise ActiveRecord::Rollback
      end
      sync_grading_contexts(@forum_post_response_question, grading_contexts_params)
      true
    end

    return :needs_confirmation if needs_confirmation

    saved ? :synced : :failed
  end

  # Links the (possibly newly-versioned) rubric and carries graded evaluations forward onto it. Returns
  # :advance_required when an incompatible change with graded answers needs confirmation (caller rolls back).
  def sync_rubric_advance(previous_active, synced)
    link_active_rubric
    return :advance_required if advance_confirmation_required?(previous_active, synced)

    advance_grading_evaluations(previous_active, synced)
    :synced
  end

  # Builds the proposed v2 rubric from the edit-page params and assigns it to the question so its validation
  # sees a present, valid active_rubric (and autosave persists a brand-new one). Copy-on-write: reuses the
  # current active rubric untouched when the proposed content + prompt + model answer are unchanged.
  def assign_active_rubric_from_params
    previous_active = @forum_post_response_question.active_rubric
    proposed = build_proposed_rubric
    synced = (previous_active && rubric_content_unchanged?(previous_active, proposed)) ? previous_active : proposed
    @forum_post_response_question.active_rubric = synced
    synced
  end

  # Question attributes to persist on update. A rubric-graded question's maximum grade is defined by its
  # rubric -- derive it rather than trust the (disabled, possibly stale) client field, so answer grades never
  # clamp below the rubric total.
  def forum_question_attributes(synced)
    attributes = forum_post_response_question_params.except(:question_assessment)
    attributes[:maximum_grade] = rubric_maximum_grade(synced) if rubric_grading_mode_param?
    attributes
  end

  # The most a rubric can award: the sum of each category's highest criterion grade.
  def rubric_maximum_grade(rubric)
    rubric.categories.sum { |category| category.criterions.map(&:grade).max.to_i }
  end

  def build_proposed_rubric
    Course::Rubric.new(
      course: current_course,
      categories: Course::Rubric.categories_from_params(rubric_params[:categories_attributes]),
      grading_prompt: rubric_params[:ai_grading_custom_prompt] || '',
      model_answer: rubric_params[:ai_grading_model_answer] || ''
    )
  end

  # Copy-on-write comparison mirroring Course::Rubric#copy_with: unchanged content (order-independent hash)
  # plus unchanged prompt/model answer means the existing version can be reused instead of versioned.
  def rubric_content_unchanged?(previous, proposed)
    proposed.assign_category_weights
    proposed.canonical_content_hash == previous.content_hash &&
      proposed.grading_prompt.to_s == previous.grading_prompt.to_s &&
      proposed.model_answer.to_s == previous.model_answer.to_s
  end

  # Records the question<->rubric link (rubric history; drives orphan cleanup on question delete). No-op when
  # the reused-unchanged rubric is already linked.
  def link_active_rubric
    rubric = @forum_post_response_question.active_rubric
    return if rubric.nil?

    question = @forum_post_response_question.acting_as
    rubric.questions << question unless rubric.question_rubrics.exists?(question_id: question.id)
  end

  def advance_confirmation_required?(previous_active, synced)
    return false if synced == previous_active || confirm_rubric_advance?

    previous_active&.incompatible_with?(synced) && advance_service(synced).pending?
  end

  # Carries graded answers' evaluations forward onto the newly-versioned rubric (no-op when the rubric was
  # reused unchanged).
  def advance_grading_evaluations(previous_active, synced)
    return if synced == previous_active

    advance_service(synced).advance!
  end

  def advance_service(new_rubric)
    Course::Rubric::GradingEvaluationAdvanceService.new(@forum_post_response_question, new_rubric)
  end

  def rubric_grading_mode_param?
    forum_post_response_question_params[:grading_mode] == 'rubric'
  end

  def confirm_rubric_advance?
    ActiveRecord::Type::Boolean.new.cast(params[:confirm_rubric_advance])
  end

  # Question attributes that are assigned directly to the forum question (includes grading_mode). Kept
  # separate from #rubric_params so the new-question builder never tries to assign rubric-only params.
  def forum_post_response_question_params
    permitted_params = [
      :title, :description, :staff_only_comments, :maximum_grade, :has_text_response, :max_posts, :grading_mode,
      :ai_grading_enabled,
      question_assessment: { skill_ids: [] }
    ]
    params.require(:question_forum_post_response).permit(*permitted_params)
  end

  # Grading contexts pulled into the rubric grading prompt (see GradingContext). Absent in default grading
  # mode, in which case #sync_grading_contexts clears any existing ones.
  def grading_contexts_params
    params.require(:question_forum_post_response).
      permit(grading_contexts: [:id, :context_type, :source_id, :identifier])[:grading_contexts]
  end

  # Rubric configuration (only meaningful in rubric grading mode); used to build the v2 active_rubric, not
  # assigned to the question itself.
  def rubric_params
    params.require(:question_forum_post_response).permit(
      :ai_grading_custom_prompt, :ai_grading_model_answer,
      categories_attributes: [:id, :name, :_destroy,
                              criterions_attributes: [:id, :grade, :explanation, :_destroy]]
    )
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@forum_post_response_question)
  end
end
