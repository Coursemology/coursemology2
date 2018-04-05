# frozen_string_literal: true
class Course::AchievementNotifier < Notifier::Base
  # To be called when user gained an achievement.
  def achievement_gained(user, achievement)
    create_activity(actor: user, object: achievement, event: :gained).
      notify(achievement.course, :feed).
      notify(user, :popup).
      save
  end
end
