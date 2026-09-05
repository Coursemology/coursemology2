# frozen_string_literal: true
module ApplicationUserConcern
  extend ActiveSupport::Concern
  include ApplicationAuthenticationConcern

  included do
    before_action :authenticate!, unless: :publicly_accessible?
    before_action :refresh_token_cookie, if: :publicly_accessible?
    rescue_from CanCan::AccessDenied, with: :handle_access_denied
    helper_method :url_to_user_or_course_user
  end

  # URL to the profile page of the given +CourseUser+ or +User+ in the current course
  #
  # @param [CourseUser|User] course_user The CourseUser/User to link to
  # @return [String | nil] A URL that points to the +CourseUser+ or +User+ profile page
  def url_to_user_or_course_user(course, user)
    return course_user_path(course, user) if user.is_a?(CourseUser)
    return user_path(user) if user.is_a?(User)

    nil
  end

  def current_user
    @current_user ||= current_user_from_token
  end

  protected

  def publicly_accessible?
    action_name.to_sym == :index && controller_name == 'application'
  end

  def handle_access_denied(exception)
    render json: { errors: exception.message }, status: :forbidden
  end

  private

  def authenticate!
    raise AuthenticationError unless devise_controller? || current_user

    update_user_tracked_fields
    add_token_to_cookie
  end

  # Refreshes the +access_token+ cookie on actions that skip +authenticate!+.
  #
  # That cookie is the only credential a browser-issued subresource request can
  # carry, since plain content tags like <img> cannot send an Authorization header.
  # This left such assets on the  course landing page (Course::CoursesController#show)
  # failing with 401 for signed-in users returning after a gap.
  #
  # Only refresh from a bearer token. A request authenticated by the cookie
  # alone would otherwise rewrite the cookie with its own value, extending the
  # lifetime of a JWT that may already be expired.
  def refresh_token_cookie
    add_token_to_cookie if token_from_bearer && current_user
  end

  def add_token_to_cookie
    cookies.encrypted[:access_token] =
      { value: token_from_request, httponly: true, expires: 1.hour.from_now }
  end

  def update_user_tracked_fields
    return if !current_user || current_user.session_id == current_session_id

    update_tracked_fields
  end

  def update_tracked_fields
    old_current, new_current = current_user.current_sign_in_at, Time.now.utc
    current_user.last_sign_in_at     = old_current || new_current
    current_user.current_sign_in_at  = new_current

    old_current, new_current = current_user.current_sign_in_ip, request.remote_ip
    current_user.last_sign_in_ip     = old_current || new_current
    current_user.current_sign_in_ip  = new_current

    current_user.sign_in_count ||= 0
    current_user.sign_in_count += 1

    current_user.session_id = current_session_id
    current_user.save
  end
end
