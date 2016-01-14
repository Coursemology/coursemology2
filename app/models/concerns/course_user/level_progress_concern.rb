module CourseUser::LevelProgressConcern
  extend ActiveSupport::Concern

  # Returns the level object of the CourseUser with respect to a course's Course::Levels.
  #
  # @return [Course::Level] Level of CourseUser.
  def current_level
    course.level_for(experience_points)
  end

  # Computes the level number of the CourseUser with respect to a course's Course::Levels.
  #
  # @return [Fixnum] Level number of CourseUser.
  def level_number
    current_level.level_number
  end
end
