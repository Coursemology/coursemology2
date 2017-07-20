# frozen_string_literal: true
module UsersAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_registered_user_manage_emails if user
    allow_registered_user_submit_role_requests if user

    super
  end

  private

  def allow_registered_user_manage_emails
    can :manage, User::Email, user_id: user.id
  end

  def allow_registered_user_submit_role_requests
    can :create, Instance::UserRoleRequest
    can :edit, Instance::UserRoleRequest, user_id: user.id
  end
end
