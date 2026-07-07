# frozen_string_literal: true
# Assembles a question's grading contexts into a single prompt block for a given student submission, each
# labelled by its identifier so the instructor's rubric/instructions can reference it. Contexts that produce
# no text (unanswered sibling, empty thread) are skipped; no contexts => '' (prompt stays unchanged).
class Course::Assessment::Question::GradingContext::Resolver
  def initialize(question, submission)
    @question = question
    @submission = submission
  end

  def resolve
    @question.grading_contexts.filter_map do |context|
      text = context.context_text(@submission)
      next if text.blank?

      "[#{context.identifier}]\n#{text}"
    end.join("\n\n")
  end
end
