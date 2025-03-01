# frozen_string_literal: true
module Course::RagWiseSettingAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_course_import if course_user&.manager_or_owner?

    super
  end

  private

  def allow_course_import
    course_users = CourseUser.where(user_id: user.id).index_by(&:course_id)
    can :import_course_forums, Course do |course|
      course_users[course.id]&.manager_or_owner?
    end
  end
end
