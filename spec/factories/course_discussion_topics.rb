# frozen_string_literal: true
FactoryGirl.define do
  factory :course_discussion_topic, class: Course::Discussion::Topic.name do
    course

    after(:build) do |topic|
      topic.actable = build(:forum_topic, topic: topic) unless topic.actable
    end
  end
end
