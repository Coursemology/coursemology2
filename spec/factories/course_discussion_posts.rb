FactoryGirl.define do
  factory :post, class: Course::Discussion::Post.name do
    creator
    updater
    parent nil
    topic { Course::Discussion::Topic.create }
    sequence(:title) { |n| "post #{n}" }
    text 'This is a test post'
  end
end
