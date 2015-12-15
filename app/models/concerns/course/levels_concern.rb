module Course::LevelsConcern
  extend ActiveSupport::Concern

  # Generates the level numbers for the Course::Levels,
  # since only the thresholds are stored in database.
  # The entries should have been sorted during the
  # database query.
  #
  # @return [Array<Course::Levels>] Array with numbered Course::Levels
  def numbered_levels
    levels.each_with_index.map do |level, index|
      level.clone.tap { |l| l.level_number = index + 1 }
    end
  end

  # Returns Course::Level object corresponding to
  # the level that a course participant would have attained if
  # s/he had experience_points number of experience points.
  #
  #
  # @param [Fixnum] experience_points Number of Experience Points
  # @return [Course::Level] A Course::Level instance.
  def level_for(experience_points)
    i = numbered_levels.rindex do |l|
      l.experience_points_threshold <= experience_points
    end
    i ? numbered_levels[i] : numbered_levels.first
  end
end
