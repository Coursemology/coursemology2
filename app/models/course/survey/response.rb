# frozen_string_literal: true
class Course::Survey::Response < ActiveRecord::Base
  acts_as_experience_points_record
  include Course::Survey::Response::TodoConcern

  belongs_to :survey, inverse_of: :responses
  has_many :answers, inverse_of: :response

  def submitted?
    submitted_at.present?
  end
end
