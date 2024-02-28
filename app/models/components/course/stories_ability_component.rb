# frozen_string_literal: true
module Course::StoriesAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_students_permissions if course_user.student?
      allow_teaching_staff_permissions if course_user.teaching_staff?
    end

    super
  end

  private

  def allow_students_permissions
    can :read, Course::Story, course_id: course.id
    can :create, Course::Story::Room, course_id: course.id
    can [:read, :update], Course::Story::Room, course_id: course.id, creator_id: user.id
  end

  def allow_teaching_staff_permissions
    can :manage, Course::Story, course_id: course.id
    can :manage, Course::Story::Room, course_id: course.id
  end
end
