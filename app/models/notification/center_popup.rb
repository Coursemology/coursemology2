class Notification::CenterPopup < Notification
  def self.notify(user, course, options = {})
    notification = CenterPopup.new(user: user, course: course)
    set_options(notification, options)
    notification.save
  end
end
