# frozen_string_literal: true
# The course level notification. This is meant to be called by the Notifications Framework
#
# @api notifications
class Course::Notification < ApplicationRecord
  enum notification_type: { feed: 0, email: 1 }

  validates_presence_of :notification_type
  validates_presence_of :activity
  validates_presence_of :course

  belongs_to :activity, inverse_of: :course_notifications
  belongs_to :course, inverse_of: :notifications
end
