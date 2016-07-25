# frozen_string_literal: true
module Course::LeaderboardsHelper
  include Course::Achievement::AchievementsHelper

  # @return [Fixnum] Number of users to be displayed, based on leaderboard settings.
  def display_user_count
    @display_user_count ||= @settings.display_user_count
  end
end
