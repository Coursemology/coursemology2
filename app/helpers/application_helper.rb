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
    course.logo.medium.url ? asset_url(course.logo.medium.url) : nil
  end
end
