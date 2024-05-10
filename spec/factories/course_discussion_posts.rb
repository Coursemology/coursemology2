# frozen_string_literal: true
FactoryBot.define do
  factory :course_discussion_post, class: 'Course::Discussion::Post' do
    transient do
      upvoted_by { [] }
      downvoted_by { [] }
    end

    creator
    updater
    parent { nil }
    association :topic, factory: :course_discussion_topic
    text { 'This is a test post' }

    after(:create) do |post, evaluator|
      Array(evaluator.upvoted_by).each do |user|
        post.cast_vote!(user, 1)
      end

      Array(evaluator.downvoted_by).each do |user|
        post.cast_vote!(user, -1)
      end
    end

    trait :draft do
      workflow_state { :draft }
    end

    trait :delayed do
      workflow_state { :delayed }
    end

    trait :published do
      workflow_state { :published }
    end

    trait :anonymous_post do
      is_anonymous { true }
    end
  end
end
