# frozen_string_literal: true
class Course::Assessment::Question::Scribing < ApplicationRecord
  acts_as :question, class_name: Course::Assessment::Question.name
  has_one_attachment

  def to_partial_path
    'course/assessment/question/scribing/scribing'
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)
    associate_duplicated_skills(duplicator, other)

    self.attachment = duplicator.duplicate(other.attachment)
  end

  # Scribing is not autogradable, don't need last attempt
  def attempt(submission, _last_attempt = nil)
    answer = Course::Assessment::Answer::Scribing.new(submission: submission, question: question)
    answer.acting_as
  end
end
