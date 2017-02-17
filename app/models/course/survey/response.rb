# frozen_string_literal: true
class Course::Survey::Response < ActiveRecord::Base
  include Course::Survey::Response::TodoConcern

  acts_as_experience_points_record

  belongs_to :survey, inverse_of: :responses
  has_many :answers, inverse_of: :response, dependent: :destroy

  accepts_nested_attributes_for :answers

  def submitted?
    submitted_at.present?
  end

  def submit
    self.submitted_at = Time.zone.now
    self.points_awarded = survey.base_exp
  end
end
