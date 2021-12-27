# frozen_string_literal: true
RSpec.configure do |config|
  # NOTE: Facebook login feature is currently disabled.
  # config.before(:suite) do
  #   OmniAuth.configure do |omniauth_config|
  #     omniauth_config.test_mode = true
  #   end
  # end

  # config.before(:each, type: :feature) do
  #   OmniAuth.config.mock_auth[:facebook] = build(:omniauth_facebook)
  # end
end
