# frozen_string_literal: true
module Course::GradebookAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_read_gradebook if course_user&.staff?
    super
  end

  private

  def allow_staff_read_gradebook
    can :read_gradebook, Course, id: course.id
  end
end
