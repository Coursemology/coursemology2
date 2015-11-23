FactoryGirl.define do
  factory :discussion_topic, class: Course::Discussion::Topic.name do
    association :actable, factory: :user
  end
end
