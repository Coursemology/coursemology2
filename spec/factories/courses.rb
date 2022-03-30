# frozen_string_literal: true
FactoryBot.define do
  factory :course do
    sequence(:title) do |n|
      timestamp = Time.zone.now.to_i.to_s
      "Course #{timestamp + n.to_s}"
    end
    description { 'example course' }
    start_at { Time.zone.now }
    end_at { 7.days.from_now }
    gamified { true }
    show_personalized_timeline_features { true }
    published { false }
    enrollable { false }

    trait :published do
      published { true }
    end

    trait :enrollable do
      enrollable { true }
    end

    trait :with_video_component_enabled do
      after(:build) do |course|
        # Save instance setting to the database so the video component remains enabled on reload.
        # Should help stop seemingly random video component spec failures.
        course.instance.set_component_enabled_boolean!(:course_videos_component, true)
        course.set_component_enabled_boolean(:course_videos_component, true)
      end
    end

    trait :with_virtual_classroom_component_enabled do
      after(:build) do |course|
        course.instance.set_component_enabled_boolean(:course_virtual_classrooms_component, true)
        course.set_component_enabled_boolean(:course_virtual_classrooms_component, true)
        course.settings(:course_virtual_classrooms_component).braincert_whiteboard_api_key =
          'FAKE_API_KEY'
      end
    end

    trait :with_mrq_options_randomization_enabled do
      after(:build) do |course|
        course.allow_mrq_options_randomization = true
      end
    end

    trait :with_logo do
      logo { Rack::Test::UploadedFile.new(File.join(Rails.root, 'spec', 'support', 'minion.png')) }
    end

    trait :with_learning_map_component_enabled do
      after(:build) do |course|
        course.instance.set_component_enabled_boolean!(:course_learning_map_component, true)
        course.set_component_enabled_boolean(:course_learning_map_component, true)
      end
    end
  end
end
