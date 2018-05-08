# frozen_string_literal: true
class Course::UserNotificationsController < Course::Controller
  load_and_authorize_resource :user_notification, class: UserNotification.name, only: :mark_as_read

  def fetch
    render json: next_popup_notification, status: :ok
  end

  def mark_as_read
    @user_notification.mark_as_read! for: current_user
    render json: next_popup_notification, status: :ok
  end

  private

  # Fetches the first unread popup `UserNotification` for the current course and returns JSON data
  # for the frontend to display it.
  #
  # @return [String] JSON data for the next notification, if there is one.
  # @return [nil] if there are no unread notifications, or no +current_course_user+.
  def next_popup_notification
    return unless current_course_user
    notification = UserNotification.next_unread_popup_for(current_course_user)
    notification && render_to_string("#{helpers.notification_view_path(notification)}.json",
                                     locals: { notification: notification })
  end
end
