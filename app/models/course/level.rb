class Course::Level < ActiveRecord::Base
  include Course::ModelComponentHost::Component
  validates :experience_points_threshold, numericality: { greater_than_or_equal_to: 0 }

  belongs_to :course, inverse_of: :levels
  default_scope { order(:experience_points_threshold) }
  attr_writer :level_number

  def self.after_course_initialize(course)
    return if course.persisted? || course.has_default_level?

    course.levels.build(experience_points_threshold: 0)
  end

  # Returns true if level is a default level.
  # Default level is currently implemented as a level with 0 threshold
  #
  # @return [Boolean]
  def default_level?
    experience_points_threshold == 0
  end

  # Returns the next higher level in the course
  # nil is returned if current level is the highest level
  #
  # @return [Course::Level] For levels with next level in the course.
  # @return [nil] If current level is the highest in the course.
  def next
    course.numbered_levels[level_number + 1]
  end

  # Retrieves the level number of the current level,
  # relative to the other levels in the same course.
  # This number is set by Course::LevelsConcern#number_levels.
  #
  # @return [Integer] Level Number.
  # @raise [RuntimeError] Raises if level_number is not set.
  def level_number
    if @level_number
      @level_number
    else
      fail IllegalStateError, "Attempted to access a Course::Level's number before computing it."
    end
  end
end
