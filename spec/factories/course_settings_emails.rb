# spec/factories/course_settings_emails.rb
FactoryBot.define do
  factory :course_settings_email, class: 'Course::Settings::Email' do
    association :course, factory: :course
    component { 0 }  # Replace with appropriate defaults
    setting { 0 }    # Replace with appropriate defaults
    phantom { true }
    regular { true }
  end
end
