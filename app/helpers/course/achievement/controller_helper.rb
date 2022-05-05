# frozen_string_literal: true
module Course::Achievement::ControllerHelper
  include Course::Achievement::AchievementsHelper
  include Course::Condition::ConditionsHelper

  # A helper to add a CSS class for each achievement, based on whether the course_user
  # is an admin, course staff, or student. For students, the method also checks whether
  # the course_user has obtained the achievement.
  #
  # @param [Course::Achievement] achievement The actual achievement.
  # @param [Course::User] current_course_user The current_course_user.
  # @return [Array<String>] CSS class to be added to the achievement tag.
  def achievement_status_class(achievement, current_course_user)
    if current_course_user.nil? || current_course_user.staff?
      nil
    elsif achievement.course_user_achievements.pluck(:course_user_id).include?(current_course_user.id)
      'granted'
    else
      'locked'
    end
  end
end
