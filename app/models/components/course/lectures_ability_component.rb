# frozen_string_literal: true
module Course::LecturesAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_students_show_lectures
      allow_staff_manage_lectures
    end

    super
  end

  private

  def allow_students_show_lectures
    can :read, Course::Lecture,
        course_all_course_users_hash
    can :access_link, Course::Lecture,
        course_all_course_users_hash
  end

  def allow_staff_manage_lectures
    can :manage, Course::Lecture, course_staff_hash
  end
end