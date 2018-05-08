# frozen_string_literal: true
module Course::ConditionsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_teaching_staff_manage_conditions if user

    super
  end

  private

  def allow_teaching_staff_manage_conditions
    can :manage, Course::Condition, course_teaching_staff_hash
    can :manage, Course::Condition::Achievement, condition: course_teaching_staff_hash
    can :manage, Course::Condition::Assessment, condition: course_teaching_staff_hash
    can :manage, Course::Condition::Level, condition: course_teaching_staff_hash
  end
end
