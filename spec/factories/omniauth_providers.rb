FactoryGirl.define do
  sequence :omniauth_facebook do
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
