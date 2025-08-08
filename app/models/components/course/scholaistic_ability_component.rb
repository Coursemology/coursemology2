# frozen_string_literal: true
module Course::ScholaisticAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      can :read, Course::ScholaisticAssessment, { lesson_plan_item: { course_id: course.id, published: true } }
      can :attempt, Course::ScholaisticAssessment, { lesson_plan_item: { course_id: course.id } }
      can :read_scholaistic_assistants, Course, { id: course.id }

      if course_user.staff?
        can :manage, Course::ScholaisticAssessment, { lesson_plan_item: { course_id: course.id } }
        can :manage_scholaistic_submissions, Course, { id: course.id }
        can :manage_scholaistic_assistants, Course, { id: course.id }
      end
    end

    super
  end
end
