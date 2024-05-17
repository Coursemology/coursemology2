# frozen_string_literal: true
module Cikgo::CourseConcern
  extend ActiveSupport::Concern

  private

  def cikgo_user_id(course_user)
    course_user.user.cikgo_user&.provided_user_id
  end

  # Maps Coursemology's `CourseUser` role to Cikgo's course user role.
  # :manager, :owner               -> 'owner'
  # :teaching_assistant, :observer -> 'instructor'
  # :student                       -> 'student'
  def cikgo_role(course_user)
    return 'owner' if course_user.manager_or_owner?
    return 'instructor' if course_user.staff?

    'student'
  end

  def push_key(course)
    stories_settings = course.settings.course_stories_component
    return unless stories_settings

    stories_settings[:push_key]
  end
end
