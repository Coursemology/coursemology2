# frozen_string_literal: true
module Course::StoriesAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_boss
      allow_students
    end

    super
  end

  private

  def allow_boss
    return unless course_user&.staff?

    can :manage, Course::Story, course_id: course.id
  end

  def allow_students
    can :read, Course::Story, course_id: course.id
  end
end
