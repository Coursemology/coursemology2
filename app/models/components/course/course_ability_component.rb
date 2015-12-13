module Course::CourseAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_showing_open_courses
    if user
      allow_unregistered_users_registering_open_courses
      allow_registered_users_showing_course
      allow_owners_managing_course
      allow_staff_manage_users
    end

    super
  end

  private

  def allow_showing_open_courses
    # TODO: Replace with just the symbols when Rails 5 is released.
    can [:read, :register], Course, status: [Course.statuses[:published], Course.statuses[:opened]]
  end

  def allow_unregistered_users_registering_open_courses
    can [:create, :register], CourseUser, user_id: user.id, workflow_state: 'pending'
  end

  def allow_registered_users_showing_course
    can [:read], Course, course_user_hash
  end

  def allow_owners_managing_course
    can :manage, Course, course_user_hash(*CourseUser::MANAGER_ROLES.to_a)
    can :manage, CourseUser, course_managers_hash
  end

  def allow_staff_manage_users
    can [:show_users, :manage_users], Course, course_user_hash(*CourseUser::STAFF_ROLES.to_a)
  end
end
