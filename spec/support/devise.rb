# frozen_string_literal: true
module DeviseControllerMacros
  # Specifies that the controller requires a user to be logged in.
  #
  # @param [nil] as if there should not be a user to be logged in.
  # @param [Symbol] as if there is a user that should be created by the factory with this name.
  def requires_login(as: nil) # rubocop:disable Naming/MethodParameterName
    before do
      @request.env['devise.mapping'] = Devise.mappings[:user]
      sign_in FactoryBot.create(as) if as
    end
  end
end

RSpec.configure do |config|
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.extend DeviseControllerMacros, type: :controller
  config.include Warden::Test::Helpers, type: :request
  config.include Warden::Test::Helpers, type: :feature
end
