# :nodoc:
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # Custom flash types. We follow Bootstrap's convention.
  add_flash_types :success, :info, :warning, :danger

  # We allow views to add breadcrumbs
  helper_method :add_breadcrumb

  include ApplicationMultitenancyConcern
  include ApplicationComponentsConcern
  include ApplicationInternationalizationConcern
  include ApplicationThemingConcern
  include ApplicationUserConcern
  include ApplicationAnnouncementsConcern

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
end
