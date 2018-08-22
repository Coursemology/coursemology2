# frozen_string_literal: true
FactoryBot.define do
  base_time = Time.zone.now.to_i
  sequence :email do |n|
    "user_#{n}@domain_#{base_time}_name.com"
  end

  factory :user_email, class: User::Email.name do
    primary { true }
    email
    confirmed

    after(:build) do |user_email|
      user_email.user ||= build(:user, emails: [user_email], emails_count: 0)
    end

    trait :confirmed do
      confirmed_at { Time.zone.now }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :without_user do
      after(:build) do |user_email|
        user_email.user = nil
      end
    end
  end
end
