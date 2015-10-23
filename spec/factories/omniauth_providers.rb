FactoryGirl.define do
  factory :omniauth_provider, class: OmniAuth::AuthHash.name do
    provider 'default'
    uid SecureRandom.random_number(2**48)
    info do
      {
        name: generate(:name),
        email: generate(:email)
      }
    end
  end

  factory :omniauth_facebook, parent: :omniauth_provider do
    provider 'facebook'
  end
end
