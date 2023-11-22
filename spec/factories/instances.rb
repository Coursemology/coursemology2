# frozen_string_literal: true
FactoryBot.define do
  base_time = Time.zone.now.to_i
  sequence :host do |n|
    "local-#{base_time}-#{n}.lvh.me"
  end

  factory :instance do
    sequence(:name) { |n| "Instance-#{base_time}-#{n}" }
    host

    trait :with_learning_map_component_enabled do
      after(:build) do |instance|
        instance.set_component_enabled_boolean(:course_learning_map_component, true)
      end
    end

    trait :with_codaveri_component_enabled do
      after(:build) do |instance|
        instance.set_component_enabled_boolean(:course_codaveri_component, true)
      end
    end
  end
end
