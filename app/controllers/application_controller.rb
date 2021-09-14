# frozen_string_literal: true
# :nodoc:
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by providing a null session when the token is missing from the request.
  protect_from_forgery(prepend: true, with: :exception)

  # Custom flash types. We follow Bootstrap's convention.
  add_flash_types :success, :info, :warning, :danger

  # We allow views to add breadcrumbs
  helper_method :add_breadcrumb

  include ApplicationMultitenancyConcern
  include ApplicationComponentsConcern
  include ApplicationInternationalizationConcern
  include ApplicationThemingConcern
  include ApplicationUserConcern
  include ApplicationUserTimeZoneConcern
  include ApplicationInstanceUserConcern
  include ApplicationAnnouncementsConcern
  include ApplicationPaginationConcern
  include ApplicationSignInCallbacksConcern

  rescue_from IllegalStateError, with: :handle_illegal_state_error
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_csrf_error

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

  # Handles +IllegalStateError+s with a HTTP 422.
  def handle_illegal_state_error(exception)
    @exception = exception
    respond_to do |format|
      format.html { render file: 'public/422', layout: false, status: 422 }
      format.json { render file: 'public/422.json', layout: false, status: 422 }
    end
  end

  def handle_csrf_error(exception)
    @exception = exception
    respond_to do |format|
      format.html { render file: 'public/403', layout: false, status: 403 }
      format.json { render file: 'public/403.json', layout: false, status: 403 }
    end
  end

  # lograge
  def append_info_to_payload(payload)
    super
    payload[:level] = if payload[:status] == 200
                        'INFO'
                      elsif payload[:status] == 302
                        'WARN'
                      else
                        'ERROR'
                      end
  end
end
