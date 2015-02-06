class Course::Level < ActiveRecord::Base
  belongs_to :course, inverse_of: :levels
  validates :experience_points_threshold, numericality: { greater_than: 0 }
end
