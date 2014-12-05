FactoryGirl.define do
  base_time = Time.now.to_i
  sequence :email do |n|
    "user_#{n}@domain_#{base_time}_name.com"
  end

  factory :user_email do
    primary true
    email

    after(:build) do |user_email|
      user_email.user = build(:user, emails: [user_email], emails_count: 0)
    end
  end

end
