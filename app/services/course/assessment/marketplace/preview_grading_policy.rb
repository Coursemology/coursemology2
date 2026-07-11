# frozen_string_literal: true
# Decides whether a question must be left ungraded by the autograders in a marketplace preview.
#
# A preview attempt is a real submission against a real (copied) assessment, so it would otherwise
# call the same graders a student's submission does — including the two that cost money per run:
# Codaveri (programming) and the rubric LLM. A previewer is only trying an assessment out, so those
# are never worth billing for; the free evaluator still runs normally.
#
# "Inert" means the question is treated as non-auto-gradable for the duration of the preview, which
# leaves the answer to be graded by hand in the real grader view. It does NOT mean "skipped":
# Course::Assessment::Submission::AutoGradingService retries `ungraded_answers` up to MAX_TRIES and
# then aggregates failures, so an answer left ungraded would spin that loop.
class Course::Assessment::Marketplace::PreviewGradingPolicy
  # @param [Course::Assessment] assessment The assessment the answer belongs to.
  # @param [Course::Assessment::Question] question The question being graded.
  # @return [Boolean] True if the paid graders must not be called for this question.
  def self.inert?(assessment, question)
    return false unless preview_copy?(assessment)

    paid_grader?(question)
  end

  # A copy made by PreviewCopyService is the only assessment carrying a marketplace preview marker.
  def self.preview_copy?(assessment)
    assessment.marketplace_preview.present?
  end

  def self.paid_grader?(question)
    specific = question.specific
    return true if specific.is_a?(Course::Assessment::Question::RubricBasedResponse)

    specific.is_a?(Course::Assessment::Question::Programming) &&
      specific.preview_inert_reason == 'codaveri'
  end

  private_class_method :preview_copy?, :paid_grader?
end
