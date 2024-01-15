# frozen_string_literal: true
class Course::Assessment::Question::Scribing < ApplicationRecord
  acts_as :question, class_name: Course::Assessment::Question.name
  has_one_attachment

  def to_partial_path
    'course/assessment/question/scribing/scribing'
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)

    self.attachment = duplicator.duplicate(other.attachment)
  end

  def attempt(submission, last_attempt = nil)
    answer = Course::Assessment::Answer::Scribing.new(submission: submission, question: question)
    last_attempt&.scribbles&.each do |scribble|
      answer.scribbles.build(content: scribble.content)
    end
    answer.acting_as
  end

  def question_type
    'Scribing'
  end

  def question_type_readable
    I18n.t('course.assessment.question.scribing.question_type')
  end
end
