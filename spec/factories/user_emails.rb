# frozen_string_literal: true
FactoryBot.define do
  # Unique per process. Specs commit (use_transactional_fixtures is false), so a bare timestamp
  # collides whenever two rspec processes start within the same second, and the second process then
  # fails User::Email's uniqueness validation. Two processes sharing a database are on the same host,
  # so their pids cannot collide; the timestamp keeps a recycled pid out of the same second and makes
  # leaked rows traceable.
  run_id = "#{Time.zone.now.to_i}-#{Process.pid}"
  sequence :email do |n|
    "user_#{n}@domain-#{run_id}-name.com"
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
