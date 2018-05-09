# frozen_string_literal: true
FactoryBot.define do
  base_time = Time.zone.now.to_i
  sequence :host do |n|
    "local-#{base_time}-#{n}.lvh.me"
  end

  factory :instance do
    sequence(:name) { |n| "Instance-#{base_time}-#{n}" }
    host

    trait :with_video_component_enabled do
      after(:build) do |instance|
        instance.set_component_enabled_boolean(:course_videos_component, true)
      end
    end

    trait :with_virtual_classroom_component_enabled do
      after(:build) do |instance|
        instance.set_component_enabled_boolean(:course_virtual_classrooms_component, true)
      end
    end
  end
end
