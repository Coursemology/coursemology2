# frozen_string_literal: true
module Course::StatisticsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_read_statistics if course_user&.staff?

    super
  end

  private

  def allow_staff_read_statistics
    can :read_statistics, Course, id: course.id
  end
end
