# spec/factories/email_unsubscriptions.rb
FactoryBot.define do
  factory :user_email_unsubscription, class: 'Course::UserEmailUnsubscription' do
    association :course_user, factory: :course_user
    association :course_setting_email, factory: :course_settings_email, strategy: :build
  end
end
