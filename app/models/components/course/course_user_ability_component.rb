# frozen_string_literal: true
module Course::CourseUserAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_course_users_show_coursemates
      allow_users_cancel_own_registration_requests
    end

    super
  end

  private

  def allow_course_users_show_coursemates
    can :read, CourseUser, course_all_course_users_hash
  end

  def allow_users_cancel_own_registration_requests
    can :deregister, CourseUser, user: user, workflow_state: 'requested'
  end
end
