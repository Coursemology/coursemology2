module System::Admin::InstanceAdminAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_instance_admin_manage_instance
      allow_instance_admin_manage_instance_users
      allow_instance_admin_manage_courses
    end

    super
  end

  private

  def allow_instance_admin_manage_instance
    can :manage, Instance, instance_user_hash(:administrator)
  end

  def allow_instance_admin_manage_instance_users
    can :manage, InstanceUser, instance_all_instance_users_hash(:administrator)
  end

  def allow_instance_admin_manage_courses
    can :manage, Course, instance_all_instance_users_hash(:administrator)
  end
end
