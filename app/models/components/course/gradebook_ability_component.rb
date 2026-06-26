# frozen_string_literal: true
module Course::GradebookAbilityComponent
  include AbilityHost::Component

  def define_permissions
    can :read_gradebook, Course, id: course.id if course_user&.manager_or_owner?
    can :manage_gradebook_weights, Course, id: course.id if course_user&.manager_or_owner?
    can :manage_gradebook_settings, Course, id: course.id if course_user&.manager_or_owner?
    can :grade, Course::ExternalAssessment if course_user&.manager_or_owner?
    super
  end
end
