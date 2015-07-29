RSpec.configure do |config|
  config.before(:suite) do
    OmniAuth.configure do |omniauth_config|
      omniauth_config.test_mode = true
      omniauth_config.mock_auth[:facebook] =
        OmniAuth::AuthHash.new(
          provider: 'facebook',
          uid: SecureRandom.random_number(2**48),
          info: {
            name: FactoryGirl.generate(:name),
            email: FactoryGirl.generate(:email)
          }
        )
    end
  end
end
