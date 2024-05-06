# frozen_string_literal: true
require 'securerandom'

module ControllerHelpers
  def current_session_id
    @current_session_id ||= SecureRandom.uuid
  end

  def controller_sign_in(controller, user)
    # Bypasses token authentication as keycloak is needed to generate the token
    # It's too complicated to generate the token manually here
    # TODO: Figure out how to properly generate and attach token to header for controller tests
    controller.instance_variable_set(:@current_user, user.reload)
    controller.instance_variable_set(:@current_session_id, current_session_id)
  end
end

RSpec.configure do |config|
  config.include ControllerHelpers, type: :controller
end
