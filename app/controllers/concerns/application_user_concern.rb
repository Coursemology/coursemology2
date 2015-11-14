module ApplicationUserConcern
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!, unless: :publicly_accessible?
    rescue_from CanCan::AccessDenied, with: :handle_access_denied
  end

  protected

  def publicly_accessible?
    is_a?(HighVoltage::PagesController)
  end

  def handle_access_denied(exception)
    @exception = exception
    render 'pages/403', status: :forbidden
  end
end
