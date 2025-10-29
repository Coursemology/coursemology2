# frozen_string_literal: true
FactoryBot.define do
  factory :course do
    transient do
      prefix { 'Course ' }
    end
    sequence(:title) do |n|
      timestamp = Time.zone.now.to_i.to_s(36)
      "#{prefix}#{timestamp}#{n}"
    end
    description { 'example course' }
    start_at { Time.zone.now }
    end_at { 7.days.from_now }
    gamified { true }
    show_personalized_timeline_features { true }
    published { false }
    enrollable { false }
    default_timeline_algorithm { 0 }

    trait :published do
      published { true }
    end

    trait :enrollable do
      enrollable { true }
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

    trait :with_multiple_reference_timelines_component_enabled do
      after(:build) do |course|
        course.instance.set_component_enabled_boolean!(:course_multiple_reference_timelines_component, true)
        course.set_component_enabled_boolean(:course_multiple_reference_timelines_component, true)
      end
    end

    trait :with_rag_wise_component_enabled do
      after(:build) do |course|
        course.instance.set_component_enabled_boolean!(:course_rag_wise_component, true)
        course.set_component_enabled_boolean(:course_rag_wise_component, true)
      end
    end

    trait :with_stories_component_enabled do
      after(:build) do |course|
        course.instance.set_component_enabled_boolean!(:course_stories_component, true)
        course.set_component_enabled_boolean(:course_stories_component, true)
      end
    end

    trait :with_plagiarism_component_enabled do
      after(:build) do |course|
        course.instance.set_component_enabled_boolean!(:course_plagiarism_component, true)
        course.set_component_enabled_boolean(:course_plagiarism_component, true)
      end
    end

    trait :with_scholaistic_component_enabled do
      after(:build) do |course|
        course.instance.set_component_enabled_boolean!(:course_scholaistic_component, true)
        course.set_component_enabled_boolean(:course_scholaistic_component, true)
      end
    end
  end
end
