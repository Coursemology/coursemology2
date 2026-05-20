# frozen_string_literal: true
module Course::GradebookAbilityComponent
  include AbilityHost::Component

  def define_permissions
    can :read_gradebook, Course, id: course.id if course_user&.staff?
    if course_user&.manager_or_owner?
      can :manage_gradebook_weights, Course, id: course.id # Reserved for weights-editing endpoint in follow-on PR
      can :manage_gradebook_settings, Course, id: course.id
    end
    super
  end
end
