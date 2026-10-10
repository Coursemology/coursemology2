# frozen_string_literal: true
#
# Authoring of a rubric-graded question's v2 rubric (Course::Rubric) from its edit page, shared by every
# question type that supports rubric grading (RBR, forum post, ...). The rubric is built directly from the
# request params; the deprecated v1 rubric rows (RubricBasedResponseCategory/Criterion) are never read or
# written.
#
# Rubrics are copy-on-write: an edit either reuses the current active rubric (unchanged content) or creates
# a new version, which becomes the question's active rubric. Graded answers' grading evaluations are then
# advanced onto the new version (Course::Rubric::GradingEvaluationAdvanceService).
#
# Including controllers implement:
#   #rubric_question -- the (specific) question being authored
#   #rubric_params   -- permitted :categories_attributes, :ai_grading_custom_prompt, :ai_grading_model_answer
module Course::Assessment::Question::RubricAuthoringConcern
  extend ActiveSupport::Concern

  private

  # Builds the proposed v2 rubric from the params and assigns it to the question, so the question's
  # validation sees it (and saving the question persists a brand-new one). Reuses the current active rubric
  # untouched when the proposed content, prompt and model answer are unchanged. Returns the assigned rubric.
  def assign_active_rubric_from_params
    previous_active = rubric_question.active_rubric
    proposed = build_proposed_rubric
    synced = (previous_active && rubric_content_unchanged?(previous_active, proposed)) ? previous_active : proposed
    rubric_question.active_rubric = synced
    synced
  end

  # Links the (possibly newly-versioned) rubric and carries graded evaluations forward onto it. Returns
  # :advance_required when an incompatible change with graded answers needs confirmation (the caller rolls
  # back), :synced otherwise.
  def sync_rubric_advance(previous_active, synced)
    link_active_rubric
    return :advance_required if advance_confirmation_required?(previous_active, synced)

    advance_grading_evaluations(previous_active, synced)
    :synced
  end

  def build_proposed_rubric
    Course::Rubric.new(
      course: current_course,
      categories: Course::Rubric.categories_from_params(rubric_params[:categories_attributes]),
      grading_prompt: rubric_params[:ai_grading_custom_prompt] || '',
      model_answer: rubric_params[:ai_grading_model_answer] || ''
    ).tap { |proposed| keep_stored_explanations(proposed, rubric_question.active_rubric) }
  end

  # The edit page serves criterion explanations sanitised, and its rich text editor may re-serialise them, so an
  # explanation the user did not change can come back as different HTML with the same content (e.g. re-quoted
  # attributes). Keep the stored text for those: otherwise an unchanged rubric would hash differently and be saved
  # as a new version, incompatible with the graded answers.
  def keep_stored_explanations(proposed, previous)
    return unless previous

    stored = previous.categories.to_h do |category|
      [category.name, category.criterions.to_h { |criterion| [criterion.grade, criterion.explanation] }]
    end
    proposed.categories.each do |category|
      category.criterions.each do |criterion|
        stored_explanation = stored.dig(category.name, criterion.grade)
        next unless stored_explanation && same_explanation?(stored_explanation, criterion.explanation)

        criterion.explanation = stored_explanation
      end
    end
  end

  def same_explanation?(stored_explanation, submitted_explanation)
    helpers.sanitize_ckeditor_rich_text(stored_explanation.to_s) ==
      helpers.sanitize_ckeditor_rich_text(submitted_explanation.to_s)
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
    rubric = rubric_question.active_rubric
    return if rubric.nil?

    question = rubric_question.acting_as
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
    Course::Rubric::GradingEvaluationAdvanceService.new(rubric_question, new_rubric)
  end

  def confirm_rubric_advance?
    ActiveRecord::Type::Boolean.new.cast(params[:confirm_rubric_advance])
  end
end
