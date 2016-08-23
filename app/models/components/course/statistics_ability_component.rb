# frozen_string_literal: true
module Course::StatisticsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_read_statistics if user

    super
  end

  private

  def allow_staff_read_statistics
    can :read_statistics, Course, course_user_hash(*CourseUser::STAFF_ROLES.to_a)
  end
end
