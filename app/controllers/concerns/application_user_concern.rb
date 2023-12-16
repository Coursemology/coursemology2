# frozen_string_literal: true
module ApplicationUserConcern
  extend ActiveSupport::Concern
  include ApplicationUserMasqueradeConcern
  include ApplicationUserOauthConcern

  included do
    before_action :authenticate!, unless: :publicly_accessible?
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

  def current_user
    @current_user ||= current_user_from_devise || current_user_from_doorkeeper
  end

  protected

  def publicly_accessible?
    action_name.to_sym == :index
  end

  def handle_access_denied(exception)
    render json: { errors: exception.message }, status: :forbidden
  end

  private

  # This method is more or less a copy of Devise's `authenticate_user!`. Devise responds
  # to `:warden` throws via `Devise::FailureApp`. This way, we keep the error message and
  # status code consistent with Devise (as at before Doorkeeper was used).
  #
  # https://github.com/heartcombo/devise/blob/e2242a95f3bb2e68ec0e9a064238ff7af6429545/lib/devise/controllers/helpers.rb#L153
  # https://github.com/heartcombo/devise/blob/e2242a95f3bb2e68ec0e9a064238ff7af6429545/lib/devise/controllers/helpers.rb#L120
  # https://github.com/wardencommunity/warden/blob/88d2f59adf5d650238c1e93072635196aea432dc/lib/warden/proxy.rb#L134
  def authenticate!
    throw :warden unless devise_controller? || current_user
  end

  def current_user_from_devise
    warden.authenticate(scope: :user)
  end
end
