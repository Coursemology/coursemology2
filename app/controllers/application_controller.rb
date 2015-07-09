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
  include Userstamp
end
