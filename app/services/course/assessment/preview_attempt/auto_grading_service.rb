# frozen_string_literal: true

# Answer-centric grading for a PreviewAttempt. Mirrors the answer iteration of
# Course::Assessment::Submission::AutoGradingService but omits the EXP total + publish tail.
class Course::Assessment::PreviewAttempt::AutoGradingService
  class << self
    def grade(attempt)
      new.grade(attempt)
    end
  end

  def grade(attempt)
    attempt.current_answers.each do |answer|
      next if answer.attempting?

      answer.auto_grade!(reduce_priority: true)
    end
  end
end
