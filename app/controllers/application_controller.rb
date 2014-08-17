class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :set_locale

  def set_locale
    if params[:locale]
      cookies.permanent[:locale] = I18n.locale = params[:locale]
    else
      if cookies.permanent[:locale]
        I18n.locale = cookies.permanent[:locale]
      else
        I18n.locale = I18n.default_locale
      end
    end
  end
end
