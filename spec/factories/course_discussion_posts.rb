FactoryGirl.define do
  factory :post, class: Course::Discussion::Post.name do
    creator
    updater
    parent nil
    topic
    title 'test'
    text 'This is a test post'
  end
end
