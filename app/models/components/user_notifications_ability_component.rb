# frozen_string_literal: true
module UserNotificationsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_user_mark_own_notification_as_read if user

    super
  end

  private

  def allow_user_mark_own_notification_as_read
    can :mark_as_read, UserNotification, user_id: user.id
  end
end
