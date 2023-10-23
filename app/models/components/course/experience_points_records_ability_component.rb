# frozen_string_literal: true
module Course::ExperiencePointsRecordsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_manage_experience_points_records if course_user&.teaching_staff?
    allow_read_course_experience_points_records if course_user&.observer?
    allow_read_own_experience_points_records if user

    super
  end

  private

  def allow_manage_experience_points_records
    can :manage, Course::ExperiencePointsRecord, course_user: { course_id: course.id }
  end

  def allow_read_course_experience_points_records
    can :read, Course::ExperiencePointsRecord, course_user: { course_id: course.id }
  end

  def allow_read_own_experience_points_records
    can :read, Course::ExperiencePointsRecord, course_user: { user_id: user.id }
    can :show_user_exp, Course::ExperiencePointsRecord, course_user: { user_id: user.id }
  end
end
