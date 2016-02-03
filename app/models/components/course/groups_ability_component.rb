# frozen_string_literal: true
module Course::GroupsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_staff_manage_groups
      allow_group_manager_manage_group
    end

    super
  end

  private

  def allow_staff_manage_groups
    can :manage, Course::Group, course_staff_hash
  end

  def allow_group_manager_manage_group
    can :manage, Course::Group, course_group_manager_hash
  end

  def course_group_manager_hash
    { group_users: { user_id: user.id, role: Course::GroupUser.roles[:manager] } }
  end
end
