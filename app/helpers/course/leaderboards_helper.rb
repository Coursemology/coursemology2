# frozen_string_literal: true
module Course::LeaderboardsHelper
  # @return [Fixnum] Number of users to be displayed, based on leaderboard settings.
  def display_user_count
    @display_user_count ||= @leaderboard_settings.display_user_count
  end
end
