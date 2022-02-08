# frozen_string_literal: true
module Course::GroupsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_staff_read_groups if course_user.staff?
      allow_teaching_staff_manage_groups if course_user.teaching_staff?
      allow_group_manager_manage_group unless course_user.teaching_staff?
      allow_group_manager_read_group_category unless course_user.staff?
    end

    super
  end

  private

  def allow_staff_read_groups
    can :read, Course::Group, group_category: { course_id: course.id }
    can :read, Course::GroupCategory, course_id: course.id
  end

  def allow_teaching_staff_manage_groups
    can :manage, Course::Group, group_category: { course_id: course.id }
    can :manage, Course::GroupCategory, course_id: course.id
  end

  def allow_group_manager_manage_group
    can :manage, Course::Group, course_group_manager_hash
  end

  def allow_group_manager_read_group_category
    can :read, Course::GroupCategory, course_group_category_manager_hash
  end

  def course_group_manager_hash
    { group_category: { course_id: course.id },
      group_users: { course_user_id: course_user.id, role: Course::GroupUser.roles[:manager] } }
  end

  def course_group_category_manager_hash
    { course_id: course.id,
      groups: { group_users: { course_user_id: course_user.id, role: Course::GroupUser.roles[:manager] } } }
  end
end
