module NotifyConcern
  def self.included(base)
    base.include(PublicActivity::Common)
  end

  def notify(recipient, sender, types: {})
    key = customize_key(types[:activity])
    activity_record = create_activity key: key, owner: sender, recipient: recipient
    popup_notify(activity_record) if types.key?(:popup)
    email_notify(recipient, sender, activity_record) if types.key?(:email)
  end

  private

  def popup_notify(activity_record)
    popup = NotificationStyle.new(activity_id: activity_record.id, notification_type: :popup)
    popup.save
  end

  def email_notify(recipient, sender, activity_record)
    email = NotificationStyle.new(activity_id: activity_record.id, notification_type: :email)
    email.save
    template = email_template(activity_record.key)
    NotificationMailer.notify(recipient, sender, self, template).deliver_now
  end

  def customize_key(activity)
    if activity
      "#{self.class.name.underscore.pluralize}.notifications.#{activity}"
    else
      "#{self.class.name.underscore.pluralize}.notifications.notify"
    end
  end

  def email_template(key)
    partial_root = '/'
    path = key.split('.')
    path.unshift partial_root
    path.join('/') + '/email'
  end
end
