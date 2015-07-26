# The object which represents the user's activity. This is meant to be called by the Notifications
# Framework
#
# @api notifications
class Activity < ActiveRecord::Base
  belongs_to :object, polymorphic: true
  belongs_to :actor, inverse_of: :activities, class_name: User.name
  belongs_to :course, inverse_of: :activities
  has_many :course_notifications, inverse_of: :activity, dependent: :destroy,
                                  class_name: Course::Notification.name
  has_many :user_notifications, inverse_of: :activity, dependent: :destroy

  USER_NOTIFICATION_TYPES = [:email, :popup]
  COURSE_NOTIFICATION_TYPES = [:email, :feed]

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
      fail ArgumentError, 'Invalid recipient type'
    end
  end

  private

  def notify_course(course, type)
    fail ArgumentError, 'Invalid course notification type' unless COURSE_NOTIFICATION_TYPES.
                                                                  include?(type)
    self.course = course
    course_notifications.build(notification_type: type)
  end

  def notify_user(user, type)
    fail ArgumentError, 'Invalid user notification type' unless USER_NOTIFICATION_TYPES.
                                                                include?(type)
    user_notifications.build(user: user, notification_type: type)
  end
end
