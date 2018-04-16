# frozen_string_literal: true
module Course::DuplicationAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      disallow_superusers_duplicate_via_frontend
      allow_managers_duplicate_to_course
      allow_managers_duplicate_from_course
    end

    super
  end

  private

  # Restrict the lists of courses that superusers can duplicate to and from.
  # Without this, the lists will consist of all courses in the instance.
  def disallow_superusers_duplicate_via_frontend
    cannot :duplicate_to, Course
    cannot :duplicate_from, Course
  end

  def allow_managers_duplicate_to_course
    can :duplicate_to, Course, course_user_hash(*CourseUser::MANAGER_ROLES.to_a)
  end

  def allow_managers_duplicate_from_course
    can :duplicate_from, Course, course_user_hash(*CourseUser::MANAGER_ROLES.to_a)
  end
end
