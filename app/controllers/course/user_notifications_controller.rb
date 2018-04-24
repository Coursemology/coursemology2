# frozen_string_literal: true
class Course::UserNotificationsController < Course::Controller
  load_and_authorize_resource :user_notification, class: UserNotification.name

  def mark_as_read
    @user_notification.mark_as_read! for: current_user
    render json: next_popup_notification, status: :ok
  end
end
