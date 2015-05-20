module NotifyConcern
  def self.included(base)
    base.include(PublicActivity::Common)
  end

  # Send notifications according to input types based on object which calls the method.
  #
  # @param [Object] recipient who does these notifications send for
  # @param [Object] sender who generate this notification
  # @param [Hash] types which kinds of notifications you want to send
  # @option types [Symbol] :activity The type of activity
  # @option types [True] :popup Enable to send a popup notification
  # @option types [True] :email Enable to send an email notification
  def notify(recipient, sender, types: {})
    key = customize_key(types[:activity])
    activity_record = create_activity key: key, owner: sender, recipient: recipient
    popup_notify(activity_record) if types.key?(:popup)
    email_notify(recipient, sender, activity_record) if types.key?(:email)
  end

  private

  # Save popup notification record in database based on a given activity record
  #
  # @param [Activity] activity_record Activity that the popup notification based on
  def popup_notify(activity_record)
    popup = NotificationStyle.new(activity_id: activity_record.id, notification_type: :popup)
    popup.save
  end

  # Save email notification record in database and send out the email based on a given
  #   activity record
  #
  # @param [Object] recipient who does these notifications send for
  # @param [Object] sender who sends this notification
  # @param [Activity] activity_record Activity that the email notification based on
  def email_notify(recipient, sender, activity_record)
    email = NotificationStyle.new(activity_id: activity_record.id, notification_type: :email)
    email.save
    template = email_template(activity_record.key)
    NotificationMailer.notify(recipient, sender, self, template).deliver_now
  end

  # Customize the key of activity
  #
  # @example customize_key(:created) => SomeObjects.notifications.created
  # @example customize_key(nil) => SomeObjects.notifications.notify
  #
  # @param [Symbol] activity The type of activity
  # @return [String]
  def customize_key(activity)
    if activity
      "#{self.class.name.underscore.pluralize}.notifications.#{activity}"
    else
      "#{self.class.name.underscore.pluralize}.notifications.notify"
    end
  end

  # Get email notification's template path from the key of activity which this notification is
  #   based on
  #
  # @param [Symbol] activity The type of activity
  # @return [String]
  def email_template(key)
    partial_root = '/'
    path = key.split('.')
    path.unshift partial_root
    path.join('/') + '/email'
  end
end
