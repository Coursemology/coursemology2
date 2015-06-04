module Course::NotificationsConcern
  extend ActiveSupport::Concern

  included do
    before_action :load_unread_popups
  end

  private

  def load_unread_popups #:nodoc:
    return [] unless current_course && current_user
    notifications_id = Notification.where(popup: true).unread_by(current_user).select(:id)
    @popups = Activity.where(owner: current_course, notification_id: notifications_id).
              includes(:recipient, :trackable)
  end
end
