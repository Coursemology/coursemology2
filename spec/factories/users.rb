FactoryGirl.define do
  factory :user do
    transient do
      emails_count 1
    end

    password 'lolololol'

    after(:build) do |user, evaluator|
      user.emails.concat(build_list(:user_email, evaluator.emails_count, user: user))
    end
  end
end
