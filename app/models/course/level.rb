class Course::Level < ActiveRecord::Base
  validates :experience_points_threshold, numericality: { greater_than: 0 }
  belongs_to :course, inverse_of: :levels
  default_scope { order(:experience_points_threshold) }
  attr_writer :level_number

  # Retrieves the level number of the current level,
  # relative to the other levels in the same course.
  # This number is set by Course::LevelsConcern#number_levels.
  #
  # @return [Integer] Level Number
  # @raise [RuntimeError] Raises if level_number is not set.
  def level_number
    if @level_number
      @level_number
    else
      fail IllegalStateError, "Attempted to access a Course::Level's number before computing it."
    end
  end
end
