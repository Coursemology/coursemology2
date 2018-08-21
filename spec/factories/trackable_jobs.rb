# frozen_string_literal: true
FactoryBot.define do
  factory :trackable_job, class: TrackableJob::Job do
    id { SecureRandom.uuid }
    trait :completed do
      status { 'completed' }
    end

    trait :errored do
      status { 'errored' }
    end
  end
end
