# frozen_string_literal: true
FactoryBot.define do
  factory :course_monitoring_heartbeat, class: 'Course::Monitoring::Heartbeat', aliases: [:heartbeat] do
    session factory: :course_monitoring_session

    user_agent { 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132' }
    ip_address { '192.168.12.21' }
    generated_at { Time.zone.now }
    stale { false }

    trait :stale do
      stale { true }
    end
  end
end
