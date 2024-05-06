# frozen_string_literal: true
module Cikgo::CourseConcern
  extend ActiveSupport::Concern

  private

  def cikgo_user_id(course_user)
    course_user.user.cikgo_user&.provided_user_id
  end

  def push_key(course)
    stories_settings = course.settings.course_stories_component
    return unless stories_settings

    stories_settings[:push_key]
  end
end
