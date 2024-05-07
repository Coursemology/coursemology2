# frozen_string_literal: true
FactoryBot.define do
  factory :course_discussion_topic, class: 'Course::Discussion::Topic' do
    course
    pending_staff_reply { false }

    after(:build) do |topic|
      topic.actable = build(:forum_topic, discussion_topic: topic) unless topic.actable
    end

    trait :with_post do
      after(:build) do |topic|
        topic.posts = [build(:course_discussion_post, topic: topic)]
      end
    end

    trait :with_delayed_post do
      after(:build) do |topic|
        topic.posts = [build(:course_discussion_post, :delayed, topic: topic)]
      end
    end

    trait :with_both_normal_and_delayed_post do
      after(:build) do |topic|
        topic.posts = [build(:course_discussion_post, :delayed, topic: topic),
                       build(:course_discussion_post, topic: topic)]
      end
    end

    trait :pending do
      pending_staff_reply { true }
    end
  end
end
