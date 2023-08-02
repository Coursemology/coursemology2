# frozen_string_literal: true

module ApplicationHelper
  include ApplicationJobsHelper
  include ApplicationNotificationsHelper

  include ApplicationFormattersHelper
  include RouteOverridesHelper

  def user_time_zone
    user_signed_in? ? current_user.time_zone : nil
  end

  def url_to_course_logo(course)
    asset_url(course_logo_local_url(course))
  end

  private

  def course_logo_local_url(course)
    course.logo.medium.url || 'course_default_logo.svg'
  end
end
