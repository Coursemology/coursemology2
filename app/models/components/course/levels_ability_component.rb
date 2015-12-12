module Course::LevelsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_manage_levels if user

    super
  end

  private

  def allow_staff_manage_levels
    can :manage, Course::Level, course_staff_hash
  end
end
