# frozen_string_literal: true
module Course::LevelsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_staff_read_levels
      allow_teaching_staff_manage_levels
    end

    super
  end

  private

  def allow_staff_read_levels
    can :read, Course::Level, course_staff_hash
  end

  def allow_teaching_staff_manage_levels
    can :manage, Course::Level, course_teaching_staff_hash
    # User cannot delete default level
    cannot :destroy, Course::Level, experience_points_threshold: 0
  end
end
