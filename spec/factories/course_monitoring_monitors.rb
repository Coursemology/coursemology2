# frozen_string_literal: true
FactoryBot.define do
  factory :course_monitoring_monitor, class: Course::Monitoring::Monitor.name do
    assessment

    enabled { true }
    min_interval_ms { Course::Monitoring::Monitor::DEFAULT_MIN_INTERVAL_MS }
    max_interval_ms { Course::Monitoring::Monitor::DEFAULT_MIN_INTERVAL_MS * 2 }
    offset_ms { 2000 }

    trait :disabled do
      enabled { false }
    end

    trait :with_secret do
      sequence(:secret) { |n| "secret_#{n}" }
    end
  end
end
