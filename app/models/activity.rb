# frozen_string_literal: true
# The object which represents the user's activity. This is meant to be called by the Notifications
# Framework
#
# @api notifications
class Activity < ApplicationRecord
  belongs_to :object, polymorphic: true
  belongs_to :actor, inverse_of: :activities, class_name: User.name
  has_many :course_notifications, class_name: Course::Notification.name, dependent: :destroy
  has_many :user_notifications, dependent: :destroy

  USER_NOTIFICATION_TYPES = [:email, :popup].freeze
  COURSE_NOTIFICATION_TYPES = [:email, :feed].freeze

  # Send notifications according to input type and recipient
  #
  # @param [Object] recipient The recipient of the notification
  # @param [Symbol] type The type of notification
  def notify(recipient, type)
    case recipient
    when Course
      notify_course(recipient, type)
    when User
      notify_user(recipient, type)
    else
      raise ArgumentError, 'Invalid recipient type'
    end
  end

  private

  def notify_course(course, type)
    raise ArgumentError, 'Invalid course notification type' unless COURSE_NOTIFICATION_TYPES.
                                                                   include?(type)
    course_notifications.build(course: course, notification_type: type)
  end

  def notify_user(user, type)
    raise ArgumentError, 'Invalid user notification type' unless USER_NOTIFICATION_TYPES.
                                                                 include?(type)
    user_notifications.build(user: user, notification_type: type)
  end
end
