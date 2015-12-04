FactoryGirl.define do
  factory :post, class: Course::Discussion::Post.name do
    creator
    updater
    parent nil
    association :topic, factory: :discussion_topic
    sequence(:title) { |n| "post #{n}" }
    text 'This is a test post'
  end
end
