# frozen_string_literal: true
module Course::CourseUserAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_course_users_show_coursemates
    end

    super
  end

  private

  def allow_course_users_show_coursemates
    can :read, CourseUser, course_all_course_users_hash
  end
end
