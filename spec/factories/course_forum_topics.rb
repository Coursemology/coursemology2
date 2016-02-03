# frozen_string_literal: true
FactoryGirl.define do
  factory :forum_topic, class: Course::Forum::Topic.name do
    forum
    sequence(:title) { |n| "forum topic #{n}" }
    creator
    updater
    locked false
    hidden false
    topic_type :normal
  end
end
