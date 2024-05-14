# frozen_string_literal: true
module Course::StoriesAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_teaching_staff_access_mission_control if course_user&.teaching_staff?

    super
  end

  private

  def allow_teaching_staff_access_mission_control
    can :access_mission_control, Course, id: course.id
  end
end
