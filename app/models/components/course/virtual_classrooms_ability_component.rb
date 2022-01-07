# frozen_string_literal: true
module Course::VirtualClassroomsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_show_virtual_classrooms
      allow_staff_access_recorded_videos if course_user.staff?
      allow_teaching_staff_manage_virtual_classrooms if course_user.teaching_staff?
    end

    super
  end

  private

  def allow_show_virtual_classrooms
    can [:read, :access_link], Course::VirtualClassroom, course_id: course.id
  end

  def allow_staff_access_recorded_videos
    can :access_recorded_videos, Course, id: course.id
  end

  def allow_teaching_staff_manage_virtual_classrooms
    can :manage, Course::VirtualClassroom, course_id: course.id
  end
end
