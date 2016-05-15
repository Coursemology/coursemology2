# frozen_string_literal: true
class Course::Survey::Response < ActiveRecord::Base
  acts_as_experience_points_record
  include Course::Survey::Response::ExperiencePointsDisplayConcern

  belongs_to :survey, inverse_of: :responses
  has_many :answers, inverse_of: :response
end
