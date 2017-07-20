# frozen_string_literal: true
module System::Admin::InstanceAdminAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_instance_admin_manage_instance
      allow_instance_admin_manage_instance_users
      allow_instance_admin_manage_courses
      allow_instance_admin_manage_role_requests
    end

    super
  end

  private

  def allow_instance_admin_manage_instance
    can :manage, Instance, instance_user_hash(:administrator)
  end

  def allow_instance_admin_manage_instance_users
    can :manage, InstanceUser, instance_instance_user_hash(:administrator)
  end

  def allow_instance_admin_manage_courses
    can :manage, Course, instance_instance_user_hash(:administrator)
  end

  def allow_instance_admin_manage_role_requests
    can :manage, Instance::UserRoleRequest, instance_instance_user_hash(:administrator)
  end
end
