module Course::GroupsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_manage_groups if user

    super
  end

  private

  def allow_staff_manage_groups
    can :manage, Course::Group, course_staff_hash
  end
end
