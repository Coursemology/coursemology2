# frozen_string_literal: true
FactoryBot.define do
  factory :forum_topic, class: Course::Forum::Topic.name do
    transient do
      course { build(:course) }
    end

    forum { build(:forum, course: course) }
    sequence(:title) { |n| "forum topic #{n}" }
    creator
    updater
    locked { false }
    hidden { false }
    topic_type { :normal }

    trait :locked do
      locked { true }
    end

    trait :hidden do
      hidden { true }
    end

    after(:build) do |forum_topic, evaluator|
      forum_topic.course = evaluator.course
      forum_topic.posts.each { |p| p.text = 'I am a post' }
    end
  end
end
