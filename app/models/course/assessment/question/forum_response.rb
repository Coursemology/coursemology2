# frozen_string_literal: true
class Course::Assessment::Question::ForumResponse < ApplicationRecord
  acts_as :question, class_name: Course::Assessment::Question.name

  validates :has_text_response, presence: true
  validates :max_posts, presence: true, numericality: { only_integer: true }, in: (1..max_posts_allowed).to_a

  def question_type
    I18n.t('course.assessment.question.forum_responses.question_type')
  end

  def self.max_posts_allowed
    10
  end
end
