# frozen_string_literal: true
module Course::DuplicationAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_owner_duplicate_course if user

    super
  end

  private

  def allow_owner_duplicate_course
    # Actually unnecessary because course managers can :manage courses.
    # This is for consistency if more fine grained permissions need to be defined when
    # duplication cherry picking is supported.
    can :duplicate, Course, course_user_hash(*CourseUser::MANAGER_ROLES.to_a)
  end
end
