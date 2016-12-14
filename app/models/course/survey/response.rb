# frozen_string_literal: true
class Course::Survey::Response < ActiveRecord::Base
  include Course::Survey::Response::TodoConcern

  acts_as_experience_points_record

  belongs_to :survey, inverse_of: :responses
  has_many :answers, inverse_of: :response

  def submitted?
    submitted_at.present?
  end
end
