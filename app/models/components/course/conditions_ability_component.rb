# frozen_string_literal: true
module Course::ConditionsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_teaching_staff_manage_conditions if course_user&.teaching_staff?

    super
  end

  private

  def allow_teaching_staff_manage_conditions
    can :manage, Course::Condition, course_id: course.id
    Course::Condition::ALL_CONDITIONS.each do |condition|
      can :manage, condition[:name].constantize, condition: { course_id: course.id }
    end
  end
end
