# frozen_string_literal: true
module CourseConcern::Assessment::Submission::AnswersConcern
  extend ActiveSupport::Concern

  # Scope to obtain the latest answers for each question for Course::Assessment::Submission.
  def latest_answers
    unscope(:order).select('DISTINCT ON (question_id) *').order(:question_id, created_at: :desc)
  end

  # Load the answers belonging to a specific question.
  #
  # Keep this as a scope so the freshest data will be fetched from the database even if the
  # CollectionProxy does not have the freshest data.
  # Do not "optimise" by using `select` on the existing CollectionProxy or MCQ results will break.
  def from_question(question_id)
    where(question_id: question_id)
  end

  def create_new_answers
    # Load questions from submission instead of assessment in case of randomized assessment
    questions_to_attempt ||= questions.includes(:actable)
    new_answers = questions_to_attempt.not_answered(self).attempt(self)
    bulk_save_new_answers(new_answers) if new_answers.present?
  end

  private

  # Insert new answer records (and its actables) in bulk.
  #
  # @param [Array<Course::Assessment::Answer>] new_answers Array of new submission answers
  # @raise [ActiveRecord::RecordInvalid] If the new answers cannot be saved.
  # @return[Boolean] If new answers were created.
  def bulk_save_new_answers(new_answers)
    # When there are no existing answers, the first one will be the current_answer.
    # We first filter new_record from the new_answers and assign the current answer flag
    # below.
    new_answers_record = new_answers.select(&:new_record?)
    return false unless new_answers_record.present?

    new_answers_record.each do |new_answer_record|
      new_answer_record.current_answer = true
    end

    new_answers_actables = new_answers_record.map(&:actable)
    new_answers_group_by_actables = new_answers_actables.group_by { |actable| actable.class.to_s }

    ActiveRecord::Base.transaction do
      new_answers_group_by_actables.each_key do |key|
        key.constantize.import! new_answers_group_by_actables[key], recursive: true
      end
    end
    true
  end
end
