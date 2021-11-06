# frozen_string_literal: true
module Course::UserEmailUnsubscriptionsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_user_manage_email_subscription if user

    super
  end

  private

  def allow_user_manage_email_subscription
    can :manage, Course::UserEmailUnsubscription, course_user: { user_id: user.id }
  end
end
