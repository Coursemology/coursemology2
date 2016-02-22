# frozen_string_literal: true
module Course::LevelsConcern
  extend ActiveSupport::Concern

  # Returns Course::Level object corresponding to
  # the level that a course participant would have attained if
  # s/he had experience_points number of experience points.
  #
  # If experience_points <= 0, the level is assumed to be the
  # default level (the 0th level) with 0 experience_points threshold.
  #
  # @param [Fixnum] experience_points Number of Experience Points
  # @return [Course::Level] A Course::Level instance.
  def level_for(experience_points)
    return levels.first if experience_points < 0
    levels.reverse_order.find_by('experience_points_threshold <= ?', experience_points)
  end

  # Test if the course has a default level.
  # @return [Boolean] True if there is a default level, otherwise false.
  def default_level?
    levels.any?(&:default_level?)
  end
end
