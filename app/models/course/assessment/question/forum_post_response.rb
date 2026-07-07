# frozen_string_literal: true
class Course::Assessment::Question::ForumPostResponse < ApplicationRecord
  acts_as :question, class_name: 'Course::Assessment::Question'

  validates :max_posts, presence: true, numericality: { only_integer: true }
  validate :allowable_max_post_count
  validate :validate_active_rubric_for_rubric_mode

  # Forum post questions can be graded either the default way or against a rubric (grading_mode). More than
  # one supported mode, so the frontend renders a grading-mode switch.
  def supported_grading_modes
    ['default', 'rubric']
  end

  # A forum-post answer can feed another question's grading (as a sibling-answer context).
  def provides_grading_context?
    true
  end

  # When rubric-graded, a forum-post question can pull sibling answers and its own forum thread into its
  # grading prompt. (The frontend only surfaces the context editor under rubric grading mode.)
  def available_grading_context_types
    ['sibling_question_answer', 'forum_thread']
  end

  # Only rubric-graded forum questions with AI grading enabled are auto-gradable, and only once they have a
  # rubric to grade against. They run through the shared rubric auto-grader (same pipeline as RBR).
  def auto_gradable?
    grading_mode_rubric? && ai_grading_enabled? && active_rubric.present?
  end

  def auto_grader
    Course::Assessment::Answer::RubricAutoGradingService.new
  end

  def rubric_answer_adapter(answer, rubric)
    Course::Assessment::Answer::ForumPostResponse::AnswerAdapter.new(answer, rubric)
  end

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

  # Rubric grading needs a rubric to grade against; require a present, valid active rubric. (grading_mode and
  # active_rubric live on the acting_as question and are reached here through the acts_as proxy.)
  def validate_active_rubric_for_rubric_mode
    return unless grading_mode_rubric?
    return if active_rubric.present? && active_rubric.valid?

    errors.add(:active_rubric, active_rubric.present? ? :invalid : :blank)
  end

  def csv_downloadable?
    true
  end

  def files_downloadable?
    true
  end

  def history_viewable?
    true
  end
end
