class Course::Level < ActiveRecord::Base
  validates :experience_points_threshold, numericality: { greater_than: 0 }
  belongs_to :course, inverse_of: :levels
end
