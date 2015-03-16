# :nodoc:
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  include ApplicationMultitenancyConcern
  include ApplicationInternationalizationConcern
  include ApplicationThemingConcern
  include ApplicationDeviseConcern
  include ApplicationUserConcern
  include ApplicationAnnouncementsConcern
  include Userstamp
end
