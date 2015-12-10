module Course::LevelsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_manage_levels if user

    super
  end

  private

  def allow_staff_manage_levels
    can :manage, Course::Level, course_staff_hash
    # User cannot delete default level
    cannot :destroy, Course::Level, experience_points_threshold: 0
  end
end
