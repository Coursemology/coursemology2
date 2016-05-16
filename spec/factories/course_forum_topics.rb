# frozen_string_literal: true
FactoryGirl.define do
  factory :forum_topic, class: Course::Forum::Topic.name do
    transient do
      course { build(:course) }
    end

    forum { build(:forum, course: course) }
    sequence(:title) { |n| "forum topic #{n}" }
    creator
    updater
    locked false
    hidden false
    topic_type :normal

    after(:build) do |forum_topic, evaluator|
      forum_topic.course = evaluator.course
    end
  end
end
