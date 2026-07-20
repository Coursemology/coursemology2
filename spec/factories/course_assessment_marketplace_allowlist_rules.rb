# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_marketplace_allowlist_rule,
          class: 'Course::Assessment::Marketplace::AllowlistRule' do
    # Default to a self-contained email-domain rule so the bare factory is valid under
    # `factory_bot:lint`. Traits below override `rule_type` (and supply any needed association).
    rule_type { :email_domain }
    # Unique per invocation. Specs commit (use_transactional_fixtures is false), and email-domain
    # rules are now unique per domain, so a hardcoded default would collide with the row committed
    # by the previous run.
    sequence(:email_domain) { |n| "domain-#{n}-#{SecureRandom.hex(3)}.test" }

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
    end
    trait :everyone do
      rule_type { :everyone }
    end
  end
end
