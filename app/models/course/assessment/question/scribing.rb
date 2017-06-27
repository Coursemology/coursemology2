# frozen_string_literal: true
class Course::Assessment::Question::Scribing < ActiveRecord::Base
  acts_as :question, class_name: Course::Assessment::Question.name
  has_one_attachment

  def to_partial_path
    'course/assessment/question/scribing/scribing'
  end

  # Scribing is not autogradable, don't need last attempt
  def attempt(submission, _last_attempt = nil)
    answer = Course::Assessment::Answer::TextResponse.new(submission: submission, question: question)
    answer.acting_as
  end
end
