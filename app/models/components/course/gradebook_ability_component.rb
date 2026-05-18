# frozen_string_literal: true
module Course::GradebookAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user&.teaching_staff?
      allow_teaching_staff_read_gradebook
    elsif course_user&.staff?
      allow_staff_read_gradebook
    end
    super
  end

  private

  def allow_teaching_staff_read_gradebook
    can :read_gradebook, Course, id: course.id
  end

  def allow_staff_read_gradebook
    can :read_gradebook, Course, id: course.id
  end
end
