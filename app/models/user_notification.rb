# frozen_string_literal: true
# The user level notification. This is meant to be called by the Notifications Framework
#
# @api notifications
class UserNotification < ApplicationRecord
  acts_as_readable on: :created_at

  enum notification_type: { popup: 0, email: 1 }

  validates_presence_of :notification_type
  validates_presence_of :activity
  validates_presence_of :user

  belongs_to :activity, inverse_of: :user_notifications
  belongs_to :user, inverse_of: :notifications

  scope :ordered_by_updated_at, -> { order(updated_at: :asc) }

  # Returns the oldest unread popup notification for the given course user.
  # Popups with deleted objects will trigger destruction of that +Activity+ object.
  # +nil+ is returned if all popups are read.
  #
  # @param [CourseUser] The course_user to check notifications for.
  # @return [UserNotification|nil] The next popup notification to be shown, or nil if all are read.
  def self.next_unread_popup_for(course_user)
    popup.where(user: course_user.user).ordered_by_updated_at.
      includes(activity: { object: :course }).unread_by(course_user.user).
      find do |popup|
        present = popup.activity.object.present?
        popup.activity.destroy unless present
        present && popup.activity.from_course?(course_user.course)
      end
  end
end
