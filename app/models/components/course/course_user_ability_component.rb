# frozen_string_literal: true
module Course::CourseUserAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_course_users_show_coursemates if user

    super
  end

  private

  def allow_course_users_show_coursemates
    can :read, CourseUser, course_all_course_users_hash
  end
end
