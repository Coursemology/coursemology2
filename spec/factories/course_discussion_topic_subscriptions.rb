# frozen_string_literal: true
FactoryBot.define do
  factory :course_discussion_topic_subscription,
          class: Course::Discussion::Topic::Subscription.name do
    association :topic, factory: :course_discussion_topic
    user
  end
end
