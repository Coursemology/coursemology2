# frozen_string_literal: true
module Course::CourseAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_showing_open_courses
    if user
      allow_instructors_create_courses
      allow_unregistered_users_registering_open_courses
      allow_registered_users_showing_course
      allow_owners_managing_course
      allow_staff_manage_users
    end

    super
  end

  private

  def allow_instructors_create_courses
    can :create, Course if user.instance_users.instructor.present?
  end

  def allow_showing_open_courses
    # TODO: Replace with just the symbols when Rails 5 is released.
    can [:read], Course, published_or_opened_course_hash
  end

  def allow_unregistered_users_registering_open_courses
    can [:register], Course, opened_course_hash
    can :create, Course::EnrolRequest, course: opened_course_hash, user: user
    can :destroy, Course::EnrolRequest, user: user
  end

  def allow_registered_users_showing_course
    can [:read, :participate], Course, course_user_hash
  end

  def allow_owners_managing_course
    can :manage, Course, course_user_hash(*CourseUser::MANAGER_ROLES.to_a)
    can :manage, CourseUser, course_managers_hash
    can :manage, Course::EnrolRequest, course_managers_hash
  end

  def allow_staff_manage_users
    can [:show_users, :manage_users], Course, course_user_hash(*CourseUser::STAFF_ROLES.to_a)
  end

  def published_or_opened_course_hash
    { status: [Course.statuses[:published], Course.statuses[:opened]] }
  end

  def opened_course_hash
    { status: Course.statuses[:opened] }
  end
end
