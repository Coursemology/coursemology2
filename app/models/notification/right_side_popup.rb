class Notification::RightSidePopup < Notification
  def self.notify(user, course, options = {})
    notification = RightSidePopup.new(user: user, course: course)
    set_options(notification, options)
    notification.save
  end
end
