module Course::AchievementsHelper
  # Returns the HTML code to display the achievement badge. If badge is present, return
  # medium version of the badge (see ImageUploader for more versions). Otherwise, return
  # default achievement badge.
  #
  # @param [Course::Achievement] achievement The achievement for which to display the badge.
  # @return [String] A HTML fragment containing the image to display for the achievement.
  def display_achievement_badge(achievement)
    content_tag(:span, class: ['image']) do
      image_tag(achievement.badge.medium.url || 'achievement_blank.png')
    end
  end

  # Returns the HTML code to display a locked achievement.
  #
  # @return [String] A HTML fragment containing the image to display the locked achievement.
  def display_locked_achievement_badge
    content_tag(:span, class: ['image']) do
      image_tag('achievement_locked.svg')
    end
  end

  # A helper to add a CSS class for each achievement, based on whether the course_user
  # is an admin, course staff, or student. For students, the method also checks whether
  # the course_user has obtained the achievement.
  #
  # @param [Course::Achievement] achievement The actual achievement.
  # @param [Course::User] current_course_user The current_course_user.
  # @return [Array<String>] CSS class to be added to the achievement tag.
  def achievement_status_class(achievement, current_course_user)
    if current_course_user.nil? || current_course_user.staff?
      []
    elsif achievement.course_users.include?(current_course_user)
      ['granted']
    else
      ['locked']
    end
  end
end
