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
end
