# frozen_string_literal: true
module System::Admin::InstanceAdminAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_instance_admin_manage_instance
      allow_instance_admin_manage_instance_users if instance_user&.administrator?
      allow_instance_admin_manage_courses
      allow_instance_admin_manage_role_requests if instance_user&.administrator?
    end

    super
  end

  private

  def allow_instance_admin_manage_instance
    can :manage, Instance do |instance|
      instance.instance_users.administrator.exists?(user_id: user.id)
    end
  end

  def allow_instance_admin_manage_instance_users
    can :manage, InstanceUser
  end

  def allow_instance_admin_manage_courses
    admin_instance_ids = user.instance_users.administrator.pluck(:instance_id)
    can :manage, Course, instance_id: admin_instance_ids
    can :manage_users, Course, instance_id: admin_instance_ids
    can :manage, CourseUser, course: { instance_id: admin_instance_ids }
    can :manage, Course::EnrolRequest, course: { instance_id: admin_instance_ids }
  end

  def allow_instance_admin_manage_role_requests
    can :manage, Instance::UserRoleRequest
  end
end
