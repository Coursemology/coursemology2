# frozen_string_literal: true
FactoryBot.define do
  factory :course_monitoring_session, class: 'Course::Monitoring::Session' do
    monitor factory: :course_monitoring_monitor

    status { :listening }
    creator factory: :user

    trait :stopped do
      status { :stopped }
    end
  end
end
