# frozen_string_literal: true
module Course::Achievement::AchievementsHelper
  # Returns the path of achievement badge, if badge is present. Otherwise, return
  # default achievement badge.
  #
  # @param [Course::Achievement|nil] achievement The achievement for which to display the badge.
  # @return [String] The image path to display for the achievement.
  def achievement_badge_path(achievement = nil)
    image_path(achievement.badge.medium.url) if achievement&.badge&.medium&.url
  end
end
