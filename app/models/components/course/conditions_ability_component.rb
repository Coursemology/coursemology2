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
    can :manage, Course::Condition::Achievement, condition: { course_id: course.id }
    can :manage, Course::Condition::Assessment, condition: { course_id: course.id }
    can :manage, Course::Condition::Level, condition: { course_id: course.id }
    can :manage, Course::Condition::Survey, condition: { course_id: course.id }
    can :manage, Course::Condition::Video, condition: { course_id: course.id }
    can :manage, Course::Condition::ScholaisticAssessment, condition: { course_id: course.id }
  end
end
