# frozen_string_literal: true
module Course::LeaderboardsHelper
  include Course::Achievement::AchievementsHelper

  # @return [Integer] Number of users to be displayed, based on leaderboard settings.
  def display_user_count
    @display_user_count ||= @settings.display_user_count
  end

  # Computes the position of a student on a course's leaderboard.
  #
  # @param [Course] course
  # @param [CourseUser] course_user The student to query for.
  # @param [Integer] display_user_count The number of positions available on the leaderboard
  # @return [nil] if student is not on the leaderboard
  # @return [Integer] position of the student on the leaderboard
  def leaderboard_position(course, course_user, display_user_count)
    index = course.course_users.students.without_phantom_users.includes(:user).
            ordered_by_experience_points.take(display_user_count).find_index(course_user)
    index && index + 1
  end
end
