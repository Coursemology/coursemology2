module Course::NotificationsConcern
  extend ActiveSupport::Concern

  included do
    before_action :load_unread_popups
  end

  private

  def load_unread_popups #:nodoc:
    return [] unless current_course && current_user
    @popups = NotificationStyle.where(notification_type: :popup).unread_by(current_user).
              joins(:activity).where(activity: { owner_id: current_course.id })
  end
end
