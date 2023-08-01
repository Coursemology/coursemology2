# frozen_string_literal: true
module ApplicationUserConcern
  extend ActiveSupport::Concern
  include ApplicationUserMasqueradeConcern

  included do
    before_action :authenticate_user!, unless: :publicly_accessible?
    rescue_from CanCan::AccessDenied, with: :handle_access_denied
    helper_method :url_to_user_or_course_user
  end

  # URL to the profile page of the given +CourseUser+ or +User+ in the current course
  #
  # @param [CourseUser|User] course_user The CourseUser/User to link to
  # @return [String] A URL that points to the +CourseUser+ or +User+ profile page
  def url_to_user_or_course_user(course, user)
    return course_user_path(course, user) if user.is_a?(CourseUser)
    return user_path(user) if user.is_a?(User)
  end

  protected

  def publicly_accessible?
    action_name.to_sym == :index
  end

  def handle_access_denied(exception)
    render json: { errors: exception.message }, status: :forbidden
  end
end
