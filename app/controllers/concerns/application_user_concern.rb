# frozen_string_literal: true
module ApplicationUserConcern
  extend ActiveSupport::Concern
  include ApplicationUserMasqueradeConcern

  included do
    acts_as_token_authentication_handler_for User,
                                             fallback: :none,
                                             search: { params: false }

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
