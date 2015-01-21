FactoryGirl.define do
  factory :user, aliases: [:creator, :updater]  do
    transient do
      emails_count 1
    end

    name 'user'
    role :normal
    password 'lolololol'

    after(:build) do |user, evaluator|
      emails = build_list(:user_email, evaluator.emails_count, primary: false, user: user)
      emails.take(1).each { |user_email| user_email.primary = true }
      user.emails.concat(emails)
    end

    factory :administrator, parent: :user do
      role :administrator
    end
  end
end
