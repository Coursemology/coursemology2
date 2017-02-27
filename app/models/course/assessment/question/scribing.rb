# frozen_string_literal: true
class Course::Assessment::Question::Scribing < ActiveRecord::Base
  acts_as :question, class_name: Course::Assessment::Question.name

  def to_partial_path
    'course/assessment/question/scribing/scribing'
  end

  def attempt(submission, _last_attempt = nil)
    answer = submission.scribing_answers.build(submission: submission, question: question)
    answer.acting_as
  end
end
