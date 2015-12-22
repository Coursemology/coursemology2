FactoryGirl.define do
  base_time = Time.zone.now.to_i
  sequence :email do |n|
    "user_#{n}@domain_#{base_time}_name.com"
  end

  factory :user_email, class: User::Email.name do
    primary true
    email
    confirmed_at { Time.zone.now }

    after(:build) do |user_email|
      user_email.user ||= build(:user, emails: [user_email], emails_count: 0)
    end

    trait :unconfirmed do
      confirmed_at nil
    end
  end
end
