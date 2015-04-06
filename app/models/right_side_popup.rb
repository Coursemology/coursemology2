class RightSidePopup < Notification
  def self.create_notification(user, course, options = {})
    notification = RightSidePopup.new
    notification.user_id = user.id
    notification.course_id = course.id
    set_options(notification, options)
    notification.save
  end
end
