# frozen_string_literal: true
module Course::LevelsConcern
  extend ActiveSupport::Concern

  # Returns the Course::Level object corresponding to the experience points provided.
  # To use ruby to obtain the required level, ensure that course.levels is already loaded.
  # Otherwise, an SQL call is fired for each method call.
  #
  # If experience_points <= 0, the level is assumed to be the default level
  # (the 0th level) with 0 experience_points threshold.
  #
  # @param [Integer] experience_points Number of Experience Points
  # @return [Course::Level] A Course::Level instance.
  def level_for(experience_points)
    return first if experience_points < 0
    if loaded?
      reverse.find { |level| level.experience_points_threshold <= experience_points }
    else
      reverse_order.find_by('experience_points_threshold <= ?', experience_points)
    end
  end

  # Test if the course has a default level.
  # @return [Boolean] True if there is a default level, otherwise false.
  def default_level?
    any?(&:default_level?)
  end

  # Delete and create Course::Level objects so they match new given thresholds.
  #
  # @param [Array<Integer>] new_thresholds Array of the new experience point thresholds.
  # @return [Array<Course::Level>] Level objects with the new thresholds.
  def mass_update_levels(new_thresholds)
    # Ensure that the default level is still present in the new set of thresholds.
    new_thresholds << 0 unless new_thresholds.include?(Course::Level::DEFAULT_THRESHOLD)

    Course::Level.transaction do
      # Delete Course::Level objects which are not in the new set of thresholds.
      delete(select { |level| !new_thresholds.include?(level.experience_points_threshold) })

      new_thresholds.map do |threshold|
        find_or_create_by(experience_points_threshold: threshold)
      end
    end
  end
end
