# frozen_string_literal: true
module UserNotificationsConcern
  # Get user's unread notifications
  def unread
    unread_by(proxy_association.owner)
  end
end
