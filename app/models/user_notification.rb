# frozen_string_literal: true
# The user level notification. This is meant to be called by the Notifications Framework
#
# @api notifications
class UserNotification < ApplicationRecord
  acts_as_readable on: :created_at

  enum notification_type: { popup: 0, email: 1 }

  belongs_to :activity, inverse_of: :user_notifications
  belongs_to :user, inverse_of: :notifications

  scope :ordered_by_updated_at, -> { order(updated_at: :asc) }

  # The oldest unread popup notification for the given course and user.
  #
  # @return [UserNotification] The next popup notification to be shown.
  # @return [nil] if there are no unread notifications.
  def self.next_unread_popup_for_course_user(course, user)
    popup.where(user: user).unread_by(user).ordered_by_updated_at.
      includes(activity: { object: :course }).
      drop_while { |popup| popup.activity.from_course?(course) }.first
  end
end
