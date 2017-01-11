# frozen_string_literal: true
FactoryGirl.define do
  factory :course do
    sequence(:title) do |n|
      timestamp = Time.zone.now.to_i.to_s
      "Course #{timestamp + n.to_s}"
    end
    description 'example course'
    start_at Time.zone.now
    end_at 7.days.from_now
    gamified true

    trait :closed do
      status :closed
    end

    trait :published do
      status :published
    end

    trait :opened do
      status :opened
    end

    trait :with_video_component_enabled do
      after(:build) do |course|
        course.settings(:components, :course_videos_component).enabled = true
      end
    end
  end
end
