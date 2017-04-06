# frozen_string_literal: true
class Course::Survey::Response < ActiveRecord::Base
  include Course::Survey::Response::TodoConcern

  acts_as_experience_points_record

  belongs_to :survey, inverse_of: :responses
  has_many :answers, inverse_of: :response, dependent: :destroy

  accepts_nested_attributes_for :answers

  scope :submitted, -> { where.not(submitted_at: nil) }

  def submitted?
    submitted_at.present?
  end

  def submit
    self.submitted_at = Time.zone.now
    self.points_awarded = survey.base_exp
    self.awarded_at = Time.zone.now
    self.awarder = creator
  end

  def unsubmit
    self.submitted_at = nil
    self.points_awarded = 0
    self.awarded_at = nil
    self.awarder = nil
  end

  def build_missing_answers_and_options
    answers_hash = {}.tap do |hash|
      answers.includes(options: :question_option, question: :options).each do |answer|
        hash[answer.question_id] = answer
      end
    end
    self.answers = survey.questions.includes(:options).map do |question|
      answer = answers_hash[question.id]
      answer ? answer.build_missing_options : build_missing_answer(question)
    end
  end

  def build_missing_answer(question)
    answers.build(question: question) do |answer|
      question.options.each do |option|
        answer.options.build(question_option: option)
      end
    end
  end
end
