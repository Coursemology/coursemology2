module Course::AchievementsHelper
  # Returns the icon of the achievement, with the option of choosing
  # different versions/sizes.
  #
  # @param [Course::Achievement] achievement The achievement for which to display the badge.
  # @param [Symbol] size The specified size required, small by default. See
  #   #ImageUploader (inherited by #AchievementBadgeUploader) for more versions.
  # @return [String] A HTML fragment containing the image to display for the achievement.
  def display_achievement_badge(achievement, size: :small)
    content_tag(:span, class: ['image']) do
      image_tag(achievement_badge_url(achievement, size))
    end
  end

  private

  # Returns the url of the achievement badge given the size. If an unavailable size is
  # provided, the small size / version of the badge is returned.
  #
  # @param [Course::Achievement] achievement The achievement for which to display the badge.
  # @param [Symbol] size The size required for the achievement badge.
  # @return [String] A string describing the url of the badge
  def achievement_badge_url(achievement, size)
    if achievement.badge.versions.key?(size)
      achievement.badge.versions[size].url
    else
      achievement.badge.small.url
    end
  end
end
