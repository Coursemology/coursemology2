# frozen_string_literal: true
FactoryGirl.define do
  factory :course_discussion_post, class: Course::Discussion::Post.name do
    creator
    updater
    parent nil
    association :topic, factory: :course_discussion_topic
    text 'This is a test post'
  end
end
