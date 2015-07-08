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

  def allow_showing_open_courses
    # TODO: Replace with just the symbols when Rails 5 is released.
    can [:read, :register], Course, status: [Course.statuses[:published], Course.statuses[:opened],
                                             'published', 'opened']
  end

  def allow_unregistered_users_registering_open_courses
    can [:create, :register], CourseUser, user_id: user.id, workflow_state: 'pending'
  end

  def allow_registered_users_showing_course
    can [:read], Course, course_users: { user_id: user.id, workflow_state: ['approved'] }
  end

  def allow_owners_managing_course
    can :manage, Course, course_users: { user_id: user.id,
                                         workflow_state: 'approved',
                                         role: [CourseUser.roles[:manager],
                                                CourseUser.roles[:owner],
                                                'manager', 'owner'] }

    can :manage, CourseUser, course: { course_users: { user_id: user.id,
                                                       workflow_state: 'approved',
                                                       role: [CourseUser.roles[:manager],
                                                              CourseUser.roles[:owner],
                                                              'manager', 'owner'] } }
  end

  def allow_staff_manage_users
    can [:show_users, :manage_users], Course,
        course_users: { user_id: user.id, workflow_state: 'approved',
                        role: [CourseUser.roles[:manager],
                               CourseUser.roles[:owner],
                               CourseUser.roles[:teaching_assistant],
                               'manager', 'owner', 'teaching_assistant'] }
  end
end
