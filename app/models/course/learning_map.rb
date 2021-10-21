# frozen_string_literal: true
class Course::LearningMap < ApplicationRecord
  validates :course, presence: true
  belongs_to :course, inverse_of: :learning_map
end
