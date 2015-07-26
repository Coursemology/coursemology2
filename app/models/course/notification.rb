# The course level notification. This is meant to be called by the Notifications Framework
#
# @api notifications
class Course::Notification < ActiveRecord::Base
  belongs_to :activity, inverse_of: :course_notifications

  enum notification_type: { feed: 0, email: 1 }
end
