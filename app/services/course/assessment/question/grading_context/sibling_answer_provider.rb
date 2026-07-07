# frozen_string_literal: true
# Pulls the same student's current answer to a sibling question (the context's +source+) into the grading
# prompt. Tolerates a not-yet-answered / deleted sibling by returning nil.
class Course::Assessment::Question::GradingContext::SiblingAnswerProvider <
  Course::Assessment::Question::GradingContext::Provider
  def context_text(context, submission)
    answer = submission.answers.current_answers.find_by(question_id: context.source_id)
    answer&.grading_context_text.presence
  end
end
