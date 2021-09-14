# frozen_string_literal: true
module Course::ActivityFeedsConcern
  extend ActiveSupport::Concern

  # Loads recent activity feeds of a given course.
  #
  # @return [Array<Course::Notification>] Recent activity feed notifications
  def recent_activity_feeds
    return [] if current_course.nil?

    current_course.notifications.feed.order(created_at: :desc)
  end
end
