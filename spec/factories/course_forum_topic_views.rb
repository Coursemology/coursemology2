# frozen_string_literal: true
FactoryBot.define do
  factory :forum_topic_view, class: Course::Forum::Topic::View.name do
    association :topic, factory: :forum_topic
    user
  end
end
