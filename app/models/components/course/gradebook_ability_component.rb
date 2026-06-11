# frozen_string_literal: true
module Course::GradebookAbilityComponent
  include AbilityHost::Component

  def define_permissions
    can :read_gradebook, Course, id: course.id if course_user&.staff?
    super
  end
end
