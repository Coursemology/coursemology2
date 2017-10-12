# frozen_string_literal: true
# The user level notification. This is meant to be called by the Notifications Framework
#
# @api notifications
class UserNotification < ApplicationRecord
  acts_as_readable on: :created_at

  enum notification_type: { popup: 0, email: 1 }

  belongs_to :activity, inverse_of: :user_notifications
  belongs_to :user, inverse_of: :notifications
end
