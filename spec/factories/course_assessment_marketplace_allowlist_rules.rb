# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_allowlist_rule,
          class: 'Course::Assessment::Marketplace::AllowlistRule' do
    trait :for_user do
      rule_type { :user }
      association :user
    end
    trait :for_instance do
      rule_type { :instance }
      association :instance
    end
    trait :for_email_domain do
      rule_type { :email_domain }
      email_domain { 'schools.gov.sg' }
    end
  end
end
