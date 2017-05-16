# frozen_string_literal: true
module CourseUser::LevelProgressConcern
  extend ActiveSupport::Concern

  delegate :level_number, :next_level_threshold, to: :current_level

  # Returns the level object of the CourseUser with respect to a course's Course::Levels.
  #
  # @return [Course::Level] Level of CourseUser.
  def current_level
    @current_level ||= course.level_for(experience_points)
  end

  # Computes the percentage (a Integer ranging from 0-100) of the CourseUser's EXP progress
  # between the current level and the next.  If the CourseUser is at the highest level,
  # the percentage will be set at 100.
  #
  # eg. Current EXP: 500, Level 1 Threshold: 200, Level 2 Threshold: 600
  # Then CourseUser.level_progress_percentage = 75 # [(500 - 200) / (600 - 200)]
  #
  # @return [Integer] The CourseUser's EXP progress percentage.
  def level_progress_percentage
    if current_level.next
      current_experience_progress = experience_points - current_level.experience_points_threshold
      experience_between_levels = current_level.next.experience_points_threshold -
                                  current_level.experience_points_threshold
      100 * current_experience_progress / experience_between_levels
    else
      100
    end
  end
end
