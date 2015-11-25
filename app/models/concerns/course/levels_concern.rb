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
  # The motivation for this method is to accommodate named levels.
  #
  # nil is returned if experience_points is insufficient to
  # attain to any level, i.e. nil represents the zeroth level.
  #
  # @param [Fixnum] experience_points Number of Experience Points
  # @return [Course::Level, nil] A Course::Level instance, or nil.
  def compute_level(experience_points)
    i = numbered_levels.rindex do |l|
      l.experience_points_threshold <= experience_points
    end
    i ? numbered_levels[i] : nil
  end

  # Returns the level number that a course participant would
  # have attained if s/he had experience_points number of
  # experience points.
  #
  # @param [Fixnum] experience_points Number of experience points
  # @return [Fixnum] The level number for the given number of experience points
  def compute_level_number(experience_points)
    level = compute_level(experience_points)
    level ? level.level_number : 0
  end

  # Returns the current level's experience point (exp) threshold for
  # for a given number of experience_points.
  #
  # 0 returned if levels are not present, or if exp is below threshold of first level
  #
  # @param [Fixnum] experience_points Number of experience points
  # @return [Fixnum] The experience_points threshold of the current level
  def current_level_threshold(experience_points)
    level = compute_level(experience_points)
    level ? level.experience_points_threshold : 0
  end

  # Returns the next highest level's experience point (exp) threshold for
  # for a given number of experience_points.
  #
  # 0 returned if levels are not present
  # x returned if exp exceeds threshold of highest level, where x is threshold of
  # highest level
  #
  # @param [Fixnum] experience_points Number of experience points
  # @return [Fixnum] The experience_points threshold of the next higher level
  def next_level_threshold(experience_points)
    lvls = numbered_levels
    return 0 if lvls.empty?
    i = lvls.index do |l|
      l.experience_points_threshold > experience_points
    end
    i ||= lvls.count - 1
    lvls[i].experience_points_threshold
  end
end
