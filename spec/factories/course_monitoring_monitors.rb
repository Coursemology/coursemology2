# frozen_string_literal: true
FactoryBot.define do
  factory :course_monitoring_monitor, class: Course::Monitoring::Monitor.name do
    enabled { true }
    min_interval_ms { Course::Monitoring::Monitor::DEFAULT_MIN_INTERVAL_MS }
    max_interval_ms { Course::Monitoring::Monitor::DEFAULT_MIN_INTERVAL_MS * 2 }
    offset_ms { 2000 }

    trait :disabled do
      enabled { false }
    end

    trait :with_seb_hash do
      sequence(:seb_hash) { |n| "seb_hash_#{n}" }
    end
  end
end
