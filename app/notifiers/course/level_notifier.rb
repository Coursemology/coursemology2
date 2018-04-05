# frozen_string_literal: true
class Course::LevelNotifier < Notifier::Base
  # To be called when user reached a new level.
  def level_reached(user, level)
    create_activity(actor: user, object: level, event: :reached).
      notify(level.course, :feed).
      notify(user, :popup).
      save
  end
end
