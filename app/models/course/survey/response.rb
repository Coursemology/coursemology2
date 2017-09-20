# frozen_string_literal: true
class Course::Survey::Response < ApplicationRecord
  include Course::Survey::Response::TodoConcern

  acts_as_experience_points_record

  belongs_to :survey, inverse_of: :responses
  has_many :answers, inverse_of: :response, dependent: :destroy

  accepts_nested_attributes_for :answers, reject_if: :options_invalid

  scope :submitted, -> { where.not(submitted_at: nil) }

  def submitted?
    submitted_at.present?
  end

  def submit
    self.submitted_at = Time.zone.now
    self.points_awarded = survey.base_exp
    self.points_awarded += survey.time_bonus_exp if \
      survey.allow_response_after_end && submitted_at <= survey.end_at
    self.awarded_at = Time.zone.now
    self.awarder = creator
  end

  def unsubmit
    self.submitted_at = nil
    self.points_awarded = 0
    self.awarded_at = nil
    self.awarder = nil
  end

  def build_missing_answers
    answer_id_set = answers.pluck(:question_id).to_set
    survey.questions.each do |question|
      answers.build(question: question) unless answer_id_set.include?(question.id)
    end
  end

  private

  def options_invalid(attributes)
    if attributes[:question_option_ids]
      !valid_option_ids?(attributes[:id], attributes[:question_option_ids])
    else
      false
    end
  end

  # Checks if the given question option ids belong to the answer's question.
  #
  # @param [Integer] answer_id ID of the answer
  # @param [Array<Integer>] ids ID of the selected options
  # @return [Boolean] true if options are valid
  def valid_option_ids?(answer_id, ids)
    question_id = question_ids_hash[answer_id]
    valid_option_ids = valid_option_ids_hash[question_id]
    ids.to_set.subset?(valid_option_ids)
  end

  def question_ids_hash
    @question_ids_hash ||= answers.map { |answer| [answer.id, answer.question_id] }.to_h
  end

  def valid_option_ids_hash
    @valid_option_ids_hash ||= survey.questions.includes(:options).map do |question|
      [question.id, question.options.map(&:id).to_set]
    end.to_h
  end
end
