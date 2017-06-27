# frozen_string_literal: true
module Course::Achievement::AchievementsHelper
  # Returns the HTML code to display the achievement badge. If badge is present, return
  # medium version of the badge (see ImageUploader for more versions). Otherwise, return
  # default achievement badge.
  #
  # @param [Course::Achievement] achievement The achievement for which to display the badge.
  # @return [String] A HTML fragment containing the image to display for the achievement.
  def display_achievement_badge(achievement)
    content_tag(:span, class: ['image']) do
      image_tag(achievement_badge_path(achievement))
    end
  end

  # Returns the path of achievement badge, if badge is present. Otherwise, return
  # default achievement badge.
  #
  # @param [Course::Achievement|nil] achievement The achievement for which to display the badge.
  # @return [String] The image path to display for the achievement.
  def achievement_badge_path(achievement = nil)
    image_path(achievement&.badge&.medium&.url || 'achievement_blank.png')
  end
end
