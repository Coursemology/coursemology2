# frozen_string_literal: true
class Course::Assessment::Answer::Scribing < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name

  def to_partial_path
    'course/assessment/answer/scribing/scribing'
  end

  MAX_ATTEMPTING_TIMES = 1000
  # Returns the attempting times left for current answer.
  # The max attempting times will be returned if question don't have the limit.
  #
  # @return [Integer]
  def attempting_times_left
    @times_left ||= begin
      return MAX_ATTEMPTING_TIMES unless question.actable.attempt_limit

      times = question.actable.attempt_limit - submission.evaluated_or_graded_answers(question).size
      times = 0 if times < 0
      times
    end
  end
end
