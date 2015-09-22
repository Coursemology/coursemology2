FactoryGirl.define do
  factory :forum_topic, class: Course::Forum::Topic.name do
    forum
    title 'test'
    creator
    updater
    locked false
    hidden false
    topic_type :normal
  end
end
