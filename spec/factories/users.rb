FactoryGirl.define do
  factory :user do
    transient do
      emails_count 1
    end

    #TODO set to role :normal
    role 1
    password 'lolololol'

    after(:build) do |user, evaluator|
      emails = build_list(:user_email, evaluator.emails_count, primary: false, user: user)
      emails.take(1).each { |user_email| user_email.primary = true }
      user.emails.concat(emails)
    end
  end
end
