# frozen_string_literal: true
FactoryBot.define do
  factory :course_monitoring_monitor, class: Course::Monitoring::Monitor.name do
    enabled { true }
    min_interval_ms { 3000 }
    max_interval_ms { 4000 }
    offset_ms { 2000 }

    trait :disabled do
      enabled { false }
    end

    trait :with_seb_hash do
      sequence(:seb_hash) { |n| "seb_hash_#{n}" }
    end
  end
end
