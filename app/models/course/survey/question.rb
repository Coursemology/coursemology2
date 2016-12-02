# frozen_string_literal: true
class Course::Survey::Question < ActiveRecord::Base
  actable

  belongs_to :survey, inverse_of: :questions
end
