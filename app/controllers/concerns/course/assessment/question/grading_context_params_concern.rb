# frozen_string_literal: true
# Shared handling of a rubric-graded question's grading contexts (see Course::Assessment::Question::
# GradingContext) for the RBR and forum-post controllers. Grading contexts are plain rows (no versioning), so
# a save replaces the whole set. Runs inside the controller's save transaction; invalid input raises
# ActiveRecord::RecordInvalid so the transaction rolls back.
module Course::Assessment::Question::GradingContextParamsConcern
  extend ActiveSupport::Concern

  # Replaces +question+'s grading contexts with +contexts_params+ (an array of { context_type, source_id?,
  # identifier }). Absent/empty params clears them (e.g. a forum question in default grading mode).
  def sync_grading_contexts(question, contexts_params)
    acting = question.acting_as
    acting.grading_contexts.destroy_all
    Array(contexts_params).each do |param|
      acting.grading_contexts.create!(
        context_type: param[:context_type],
        identifier: param[:identifier],
        source: grading_context_source(param)
      )
    end
  end

  private

  # Only the sibling-answer provider has a first-class source (the sibling question); intrinsic providers
  # (forum thread) resolve their source from the consumer's own answer, so their source stays null.
  def grading_context_source(param)
    return nil unless param[:context_type] == 'sibling_question_answer'

    @assessment.questions.find_by(id: param[:source_id])
  end
end
