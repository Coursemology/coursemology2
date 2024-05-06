# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by providing a null session when the token is missing from the request.
  protect_from_forgery(prepend: true, with: :exception)

  include ApplicationControllerMultitenancyConcern
  include ApplicationAuthenticationConcern
  include ApplicationComponentsConcern
  include ApplicationInternationalizationConcern
  include ApplicationUserConcern
  include ApplicationUserTimeZoneConcern
  include ApplicationInstanceUserConcern
  include ApplicationAbilityConcern
  include ApplicationAnnouncementsConcern
  include ApplicationPaginationConcern

  rescue_from AuthenticationError, with: :handle_authentication_error
  rescue_from IllegalStateError, with: :handle_illegal_state_error
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_csrf_error

  def index
  end

  protected

  # Runs the provided block with Bullet disabled.
  #
  # @note Bullet will not be enabled again after this block returns until the next Rack request.
  #   The block syntax is in anticipation of Bullet eventually supporting temporary disabling,
  #   which currently does not work. See flyerhzm/bullet#247.
  def without_bullet
    old_bullet_enable = Bullet.enable?
    Bullet.enable = false
    yield
  ensure
    Bullet.enable = old_bullet_enable
  end

  private

  def handle_illegal_state_error(exception)
    @exception = exception
    render json: { error: exception.message }, status: :unprocessable_entity
  end

  def handle_csrf_error(exception)
    @exception = exception
    render json: { error: "Can't verify CSRF token authenticity - #{exception.message}" }, status: :forbidden
  end

  def handle_authentication_error(exception)
    @exception = exception
    render json: { error: exception.message }, status: :unauthorized
  end

  # lograge
  def append_info_to_payload(payload)
    super
    payload[:level] = case payload[:status]
                      when 200
                        'INFO'
                      when 302
                        'WARN'
                      else
                        'ERROR'
                      end
    payload[:remote_ip] = request.ip
    payload[:current_user_id] = current_user.id if current_user.present?
  end
end
