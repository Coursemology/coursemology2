# frozen_string_literal: true
FactoryBot.define do
  # Unique per process — see the note in user_emails.rb; host and name are both unique-constrained.
  run_id = "#{Time.zone.now.to_i}-#{SecureRandom.hex(3)}"
  sequence :host do |n|
    "local-#{run_id}-#{n}.lvh.me"
  end

  factory :instance do
    sequence(:name) { |n| "Instance-#{run_id}-#{n}" }
    host

    trait :with_learning_map_component_enabled do
      after(:build) do |instance|
        instance.set_component_enabled_boolean(:course_learning_map_component, true)
      end
    end
  end
end
