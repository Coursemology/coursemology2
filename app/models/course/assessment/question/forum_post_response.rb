# frozen_string_literal: true
class Course::Assessment::Question::ForumPostResponse < ApplicationRecord
  acts_as :question, class_name: 'Course::Assessment::Question'

  validates :max_posts, presence: true, numericality: { only_integer: true }
  validate :allowable_max_post_count

  def question_type
    'ForumPostResponse'
  end

  def question_type_readable
    I18n.t('course.assessment.question.forum_post_responses.question_type')
  end

  def attempt(submission, last_attempt = nil)
    answer =
      Course::Assessment::Answer::ForumPostResponse.new(submission: submission, question: question)

    if last_attempt
      answer.answer_text = last_attempt.answer_text
      answer.post_packs = last_attempt.post_packs.map(&:dup) if last_attempt.post_packs.any?
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

  def csv_downloadable?
    true
  end

  def files_downloadable?
    true
  end
end
