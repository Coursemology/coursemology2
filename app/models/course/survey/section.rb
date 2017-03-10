# frozen_string_literal: true
class Course::Survey::Section < ActiveRecord::Base
  belongs_to :survey, inverse_of: :sections
  has_many :questions, inverse_of: :section, dependent: :destroy
end
