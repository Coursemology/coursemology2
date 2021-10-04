# frozen_string_literal: true
class Course::Assessment::Question::ForumResponse < ApplicationRecord
  acts_as :question, class_name: Course::Assessment::Question.name

  validates :max_posts, presence: true, numericality: { only_integer: true }
  validate :allowable_max_post_count

  def question_type
    I18n.t('course.assessment.question.forum_responses.question_type')
  end

  def max_posts_allowed
    10
  end

  def allowable_max_post_count
    unless (1..max_posts_allowed).include?(max_posts)
      errors.add(:max_posts, "has to be between 1 and #{max_posts_allowed}")
    end
  end
end
