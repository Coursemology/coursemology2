# frozen_string_literal: true
module Course::SurveysAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_staff_manage_surveys
      allow_students_show_surveys
    end

    super
  end

  private

  def allow_staff_manage_surveys
    can :manage, Course::Survey, lesson_plan_item: course_staff_hash
  end

  def allow_students_show_surveys
    can :read, Course::Survey, lesson_plan_item: course_all_course_users_hash
  end
end
