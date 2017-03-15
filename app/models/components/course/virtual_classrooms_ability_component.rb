# frozen_string_literal: true
module Course::VirtualClassroomsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_students_show_virtual_classrooms
      allow_staff_manage_virtual_classrooms
    end

    super
  end

  private

  def allow_students_show_virtual_classrooms
    can [:read, :access_link], Course::VirtualClassroom, course_all_course_users_hash
  end

  def allow_staff_manage_virtual_classrooms
    can :manage, Course::VirtualClassroom, course_staff_hash
    can :access_recorded_videos, Course, course_user_hash(*CourseUser::STAFF_ROLES.to_a)
  end
end
