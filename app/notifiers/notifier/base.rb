# frozen_string_literal: true
# The base class of notifiers. This is meant to be called by the Notifications Framework
#
# @api notifications
class Notifier::Base
  include ApplicationNotificationsHelper

  class << self
    # This is to allow client code to create notifications without explicitly instantiating
    # notifiers
    #
    # @api private
    def method_missing(symbol, *args, &block)
      new.public_send(symbol, *args, &block)
    end
  end

  def initialize #:nodoc:
    super
    @pending_emails = []
  end

  protected

  # Create an ActivityWrapper based on options
  #
  # @param [Hash] options The options used to create an activity
  # @option options [User] :actor The actor who trigger off the activity
  # @option options :object The object which the activity is about
  # @option options [Symbol] :event The event name of activity
  def create_activity(options)
    ActivityWrapper.new(self, Activity.new(options.merge(notifier_type: self.class.name)))
  end

  private

  # Generate emails according to input recipient and notification
  #
  # @param [Object] recipient The recipient of the notification
  # @param [Course::Notification] notification The target notification
  def notify(recipient, notification)
    return unless notification.email?
    case recipient
    when Course
      email_course(notification)
    when User
      email_user(notification)
    else
      raise ArgumentError, 'Invalid recipient type'
    end
  end

  # Create emails for the users of a course based on a given course notification record
  #
  # @param [Course::Notification] notification The notification which is used to generate emails
  def email_course(notification)
    notification.course.users.each do |user|
      @pending_emails << ActivityMailer.email(recipient: user, notification: notification,
                                              view_path: notification_view_path(notification))
    end
  end

  # Create an email for a user based on a given user notification record
  #
  # @param [UserNotification] notification The notification which is used to generate the email
  def email_user(notification)
    @pending_emails << ActivityMailer.email(recipient: notification.user,
                                            notification: notification,
                                            view_path: notification_view_path(notification))
  end

  # Send out pending emails
  def send_pending_emails
    @pending_emails.pop.deliver_later until @pending_emails.empty?
  end
end
