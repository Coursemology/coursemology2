# frozen_string_literal: true
FactoryGirl.define do
  factory :discussion_topic_subscription, class: Course::Discussion::Topic::Subscription.name do
    association :topic, factory: :discussion_topic
    user
  end
end
