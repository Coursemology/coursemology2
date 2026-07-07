# frozen_string_literal: true
# Turns a Course::Assessment::Question::GradingContext row + a student submission into prompt text. A small
# registry keyed by +context_type+ maps to a provider subclass; adding a provider = a subclass + one entry.
class Course::Assessment::Question::GradingContext::Provider
  PROVIDERS = {
    'sibling_question_answer' => 'Course::Assessment::Question::GradingContext::SiblingAnswerProvider',
    'forum_thread' => 'Course::Assessment::Question::GradingContext::ForumThreadProvider'
  }.freeze

  def self.for(context_type)
    class_name = PROVIDERS[context_type]
    raise ArgumentError, "Unknown grading context type: #{context_type.inspect}" unless class_name

    class_name.constantize.new
  end

  # @param [Course::Assessment::Question::GradingContext] _context the linkage row.
  # @param [Course::Assessment::Submission] _submission the student submission being graded.
  # @return [String, nil] prompt text, or nil when the source is missing/empty (nil blocks are dropped).
  def context_text(_context, _submission)
    raise NotImplementedError
  end
end
