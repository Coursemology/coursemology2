# frozen_string_literal: true
FactoryBot.define do
  factory :omniauth_provider, class: OmniAuth::AuthHash.name do
    transient do
      name { generate(:name) }
      email { generate(:email) }
    end
    provider { 'default' }
    sequence(:uid) { |n| SecureRandom.random_number(2**48) + n }
    info do
      {}.tap do |result|
        result[:name] = name if name
        result[:email] = email if email
      end
    end
  end

  factory :omniauth_facebook, parent: :omniauth_provider do
    provider { 'facebook' }

    trait :without_email do
      email { nil }
    end
  end
end
