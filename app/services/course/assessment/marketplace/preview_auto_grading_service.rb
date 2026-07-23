# frozen_string_literal: true
# Answer-centric grading for a marketplace preview Attempt. Mirrors the answer iteration of
# Course::Assessment::Submission::AutoGradingService but omits the EXP total + publish tail — a
# preview has no course_user or experience-points record to award, and grading it must not touch
# course state.
class Course::Assessment::Marketplace::PreviewAutoGradingService
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
