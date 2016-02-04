# frozen_string_literal: true
module Course::ExperiencePointsRecordsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_staff_manage_experience_points_records
      allow_student_read_own_experience_points_records
    end

    super
  end

  private

  def allow_staff_manage_experience_points_records
    can :manage, Course::ExperiencePointsRecord, course_user: course_staff_hash
  end

  def allow_student_read_own_experience_points_records
    can :read, Course::ExperiencePointsRecord, course_user: { user_id: user.id }
  end
end
