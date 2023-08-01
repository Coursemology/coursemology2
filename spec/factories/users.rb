# frozen_string_literal: true
FactoryBot.define do
  sequence :name do |n|
    "user #{n}"
  end

  factory :user, aliases: [:creator, :updater, :actor] do
    transient do
      emails_count { 1 }
      email { nil }
    end

    name
    role { :normal }
    password { Application::Application.config.x.default_user_password }

    after(:build) do |user, evaluator|
      emails = build_list(:user_email, evaluator.emails_count, primary: false, user: user)

      if (email = evaluator.email)
        user.emails << build(:user_email, email: email, primary: true, user: user)
      else
        emails.take(1).each { |user_email| user_email.primary = true }
      end

      user.emails.concat(emails)
    end

    factory :administrator, parent: :user do
      role { :administrator }
    end
  end
end
