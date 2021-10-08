# frozen_string_literal: true
class Course::Assessment::Question::ForumPostResponse < ApplicationRecord
  acts_as :question, class_name: Course::Assessment::Question.name

  validates :max_posts, presence: true, numericality: { only_integer: true }
  validate :allowable_max_post_count

  def question_type
    I18n.t('course.assessment.question.forum_post_responses.question_type')
  end

  def attempt(submission, last_attempt = nil)
    answer =
      Course::Assessment::Answer::ForumPostResponse.new(submission: submission, question: question)
    last_attempt&.answer_options&.each do |answer_option|
      answer.answer_options.build(option_id: answer_option.option_id)
    end

    answer.acting_as
  end

  def initialize_duplicate(_duplicator, other)
    copy_attributes(other)
  end

  def max_posts_allowed
    10
  end

  def allowable_max_post_count
    return if (1..max_posts_allowed).include?(max_posts)

    errors.add(:max_posts, "has to be between 1 and #{max_posts_allowed}")
  end
end
