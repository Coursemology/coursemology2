class Notification < ActiveRecord::Base
  acts_as_readable on: :updated_at

  has_one :activity, inverse_of: :notification, dependent: :destroy

  # Send notifications according to input types and objects
  #
  # @param [Object] recipient who does these notifications send for
  # @param [Object] sender who generate these notifications
  # @param [Object] object what is these notifications about
  # @param [Symbol] activity which kind of activity will these notifications be based on
  # @param [Array<Symbol>] types which kinds of notifications that will be sent. Could take in
  #   any combination of :activity_feed, :email and :popup
  def self.notify(recipient, sender, object, activity: :notify, types: [])
    key = customize_key(object, activity)
    notification = Notification.new(activity_feed: types.include?(:activity_feed),
                                    email: types.include?(:email), popup: types.include?(:popup))
    notification.build_activity(recipient: recipient, owner: sender, trackable: object,
                                key: key, notification: notification)
    email_notify(recipient, sender, notification.activity) if notification.email
    notification.save
  end

  class << self
    private

    # Send out the email based on a given activity record
    #
    # @param [Object] recipient who does these notifications send for
    # @param [Object] sender who sends this notification
    # @param [Activity] activity the activity which belongs to this notification
    def email_notify(recipient, sender, activity)
      template = activity.template_path(:email)
      NotificationMailer.notify(recipient, sender, activity.trackable, template).deliver_now
    end

    # Customize the key of activity
    #
    # @example customize_key(@course,:created) => courses.notifications.created
    #
    # @param [Object] object The object that will be tracked
    # @param [Symbol] activity The type name of activity
    # @return [String]
    def customize_key(object, activity)
      "#{object.class.name.underscore.pluralize}.notifications.#{activity}"
    end
  end
end
