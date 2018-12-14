# frozen_string_literal: true
module Course::CourseAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_instructors_create_courses
      allow_unregistered_users_registering_courses
      allow_registered_users_showing_course
      allow_staff_manage_users
      allow_owners_managing_course
      allow_staff_manage_personal_times
    end

    super
  end

  private

  def allow_instructors_create_courses
    can :create, Course if user.instance_users.instructor.present?
  end

  def allow_unregistered_users_registering_courses
    can :create, Course::EnrolRequest, course: { enrollable: true }
    can :destroy, Course::EnrolRequest, user: user
  end

  def allow_registered_users_showing_course
    can :read, Course, course_user_hash
  end

  def allow_staff_manage_users
    can :show_users, Course, staff_hash
    can :manage_users, Course, teaching_staff_hash
  end

  def allow_owners_managing_course
    can :manage, Course, managers_hash
    can :manage, CourseUser, course_managers_hash
    can :manage, Course::EnrolRequest, course_managers_hash
  end

  def allow_staff_manage_personal_times
    can :manage_personal_times, Course, teaching_staff_hash
  end
end
